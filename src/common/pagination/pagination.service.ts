import { Brackets, FindOperator, InstanceChecker, Repository, SelectQueryBuilder } from 'typeorm';

export interface PaginatedResult<T> {
  docs: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SortOptions {
  field?: string; // For simple column sorting (e.g., 'createdAt')
  expression?: string; // For complex SQL expression sorting (e.g., 'COALESCE(...)')
  order: 'ASC' | 'DESC';
}

export class PaginationService {
  async applyPaginationAndFilters<T extends object>(
    repository: Repository<T>,
    selectFields: string[],
    whereCondition: any,
    relations: string[],
    queryOptions: any,
    searchKeys: string[],
    sortOptions: SortOptions = {
      field: 'createdAt',
      order: 'DESC',
    },
    customQueryBuilder?: SelectQueryBuilder<T>,
    getAllRecords: boolean = false,
  ): Promise<PaginatedResult<T>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        startDate,
        endDate,
        dateRangeFilter,
        tokenAddresses,
      } = queryOptions;
      const skip = (page - 1) * limit;

      const queryBuilder: any = customQueryBuilder ?? repository.createQueryBuilder('entity');

      // Apply where conditions dynamically
      this.applyDynamicFilters(queryBuilder, whereCondition);

      // Apply date filtering
      if (startDate) queryBuilder.andWhere('entity.createdAt >= :startDate', { startDate });
      if (endDate) queryBuilder.andWhere('entity.createdAt <= :endDate', { endDate });

      // Handle date range filtering if provided
      if (Array.isArray(dateRangeFilter)) {
        dateRangeFilter.forEach((filter, index) => {
          if (filter?.fieldName && filter?.min && filter?.max) {
            queryBuilder.andWhere(
              `entity.${filter.fieldName} BETWEEN :min${index} AND :max${index}`,
              {
                [`min${index}`]: filter.min,
                [`max${index}`]: filter.max,
              },
            );
          }
        });
      }

      const entityColumns = repository.metadata.columns.map(col => col.propertyName);

      const relationColumns: string[] = [];

      // Automatically include all fields of related entities
      relations.forEach(relation => {
        const parts = relation.split('.');
        let parentAlias = 'entity';
        parts.forEach((currentRelation, index) => {
          const alias = parts.slice(0, index + 1).join('_');
          if (!queryBuilder.expressionMap.aliases.some((a: any) => a.name === alias)) {
            queryBuilder.leftJoinAndSelect(`${parentAlias}.${currentRelation}`, alias);
          }
          parentAlias = alias;
        });
      });

      // Get the primary key column of the entity
      const primaryColumn = repository.metadata.primaryColumns[0]?.propertyName;

      let selectClause: string[];

      if (selectFields.length > 0) {
        selectClause = [...new Set([...selectFields, primaryColumn, 'createdAt', 'updatedAt'])].map(
          field => {
            const parts = field.split('.');

            if (parts.length > 1) {
              // It's a relation like 'agent.uId'
              const column = parts.pop();
              const relationAlias = parts.join('_');
              return `${relationAlias}.${column}`;
            }

            if (entityColumns.includes(field)) {
              return `entity.${field}`; // Direct column on main entity
            } else {
              return field;
            }
          },
        );
      } else {
        // This block is for when selectFields is empty (select all entity columns + relations)
        const relationColumns: string[] = [];
        relations.forEach(relation => {
          const relationMetadata = repository.metadata.findRelationWithPropertyPath(relation);
          if (relationMetadata) {
            const relatedEntityColumns = relationMetadata.inverseEntityMetadata.columns.map(
              col => col.propertyName,
            );
            relatedEntityColumns.forEach(col => {
              relationColumns.push(`${relation}.${col}`);
            });
          }
        });
        selectClause = [
          ...entityColumns.map(col => `entity.${col}`),
          ...relationColumns.map(field => {
            const parts = field.split('.');
            const column = parts.pop();
            const relationAlias = parts.join('_');
            return `${relationAlias}.${column}`;
          }),
        ];
      }

      queryBuilder.select([...new Set(selectClause)]);

      // Apply relations (Handling Nested Relations)
      relations.forEach(relation => {
        const parts = relation.split('.'); // Handle nested relations
        let parentAlias = 'entity'; // Start from main entity

        parts.forEach((currentRelation, index) => {
          const alias = parts.slice(0, index + 1).join('_'); // Ensure unique alias

          // Avoid duplicate joins
          if (!queryBuilder.expressionMap.aliases.some((a: any) => a.name === alias)) {
            queryBuilder.leftJoinAndSelect(`${parentAlias}.${currentRelation}`, alias);
          }

          parentAlias = alias; // Update for the next relation level
        });
      });
      // Apply sorting
      if (sortOptions.expression) {
        console.log('sortOptions.expression', sortOptions);
        // If an explicit SQL expression is provided, use it directly.
        // (This won't be hit for raisedFundsPercent with the current setup, but good to keep)
        queryBuilder.orderBy(sortOptions.expression, sortOptions.order);
      } else if (sortOptions.field) {
        // Determine if the field is a direct entity column or a custom alias.
        if (entityColumns.includes(sortOptions.field)) {
          // It's a direct entity column, prefix with 'entity.'
          queryBuilder.orderBy(`entity.${sortOptions.field}`, sortOptions.order);
        } else {
          // It's a custom alias (like 'raisedFundsPercent'), use it directly.
          queryBuilder.orderBy(sortOptions.field, sortOptions.order);
        }
      } else {
        // Default sorting if no field or expression is provided.
        queryBuilder.orderBy('entity.createdAt', 'DESC');
      }

      if (search && searchKeys.length > 0) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            const conditions: string[] = [];
            const parameters: Record<string, any> = {};
            const searchLower = search.toLowerCase();

            const searchWords = searchLower.split(' ').filter(Boolean);

            // Group search keys by alias
            const aliasGroups: Record<string, Set<string>> = {};

            searchKeys.forEach(key => {
              const [alias, column] = key.includes('.') ? key.split('.') : ['entity', key];
              if (!aliasGroups[alias]) aliasGroups[alias] = new Set();
              aliasGroups[alias].add(column);
            });

            // Add combined firstName + lastName search for each alias group that has both
            if (searchWords.length >= 2) {
              const combinedParam = `combined_full_name`;
              const combinedValue = `%${searchLower}%`;
              parameters[combinedParam] = combinedValue;

              Object.entries(aliasGroups).forEach(([alias, columns]) => {
                if (columns.has('firstName') && columns.has('lastName')) {
                  conditions.push(
                    `LOWER(CONCAT(${alias}.firstName, ' ', ${alias}.lastName)) LIKE :${combinedParam}`,
                  );
                }
              });
            }

            // Fallback to individual field search
            searchKeys.forEach((key, index) => {
              const [alias, column] = key.includes('.') ? key.split('.') : ['entity', key];
              const paramKey = `search_${index}`;
              conditions.push(`LOWER(${alias}.${column}) LIKE :${paramKey}`);
              parameters[paramKey] = `%${searchLower}%`;
            });

            qb.where(conditions.join(' OR '));
            queryBuilder.setParameters(parameters);
          }),
        );
      }

      if (!getAllRecords) {
        // Apply pagination
        queryBuilder.skip(skip).take(limit);
      }
      // Fetch results
      const [data, totalCount] = await queryBuilder.getManyAndCount();

      return {
        docs: data,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error(error.message);
    }
  }

  private applyDynamicFilters<T extends object>(
    queryBuilder: SelectQueryBuilder<T>,
    whereCondition: Record<string, any>,
  ) {
    const resolveFindOperator = (operator: FindOperator<any>): { type: string; value: any } => {
      let current = operator;
      while (current.value instanceof FindOperator) {
        current = current.value;
      }
      return { type: current.type, value: current.value };
    };

    const isSerializedFindOperator = (val: any): boolean => {
      if (!val || typeof val !== 'object') return false;
      if (typeof val._type === 'string' && Object.prototype.hasOwnProperty.call(val, '_value')) return true;
      const keys = Object.keys(val);
      return keys.some(k => k.startsWith('$'));
    };

    const resolveSerializedFindOperator = (val: any): { type: string; value: any } => {
      // Case 1: Serialized TypeORM FindOperator shape
      if (typeof val._type === 'string' && Object.prototype.hasOwnProperty.call(val, '_value')) {
        return { type: val._type, value: val._value };
      }
      // Case 2: JSON friendly operators
      if (val.$in !== undefined) return { type: 'in', value: val.$in };
      if (val.$nin !== undefined) return { type: 'not', value: val.$nin };
      if (val.$ne !== undefined) return { type: 'not', value: val.$ne };
      if (val.$lt !== undefined) return { type: 'lessThan', value: val.$lt };
      if (val.$gt !== undefined) return { type: 'moreThan', value: val.$gt };
      if (val.$lte !== undefined) return { type: 'lessThanOrEqual', value: val.$lte };
      if (val.$gte !== undefined) return { type: 'moreThanOrEqual', value: val.$gte };
      if (val.$between !== undefined) return { type: 'between', value: val.$between };
      if (val.$like !== undefined) return { type: 'like', value: val.$like };
      if (val.$ilike !== undefined) return { type: 'ilike', value: val.$ilike };
      if (val.$isNull !== undefined) return { type: val.$isNull ? 'isNull' : 'not', value: null };
      if (val.$and !== undefined) return { type: 'and', value: Array.isArray(val.$and) ? val.$and : [val.$and] };
      if (val.$or !== undefined) return { type: 'or', value: Array.isArray(val.$or) ? val.$or : [val.$or] };
      // Default fallback: equality
      return { type: 'eq', value: val } as any;
    };

    // Root-level logical operators support: $or / $and
    if (whereCondition && typeof whereCondition === 'object') {
      const { $or, $and, ...rest } = whereCondition as any;
      if (Array.isArray($or) && $or.length > 0) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            $or.forEach((sub, idx) => {
              qb.orWhere(
                new Brackets(inner => {
                  // Apply each subcondition group to inner builder
                  this.applyDynamicFilters(inner as any, sub);
                }),
              );
            });
          }),
        );
        // Continue processing remaining keys below
        whereCondition = rest;
      }
      if (Array.isArray($and) && $and.length > 0) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            $and.forEach((sub, idx) => {
              qb.andWhere(
                new Brackets(inner => {
                  this.applyDynamicFilters(inner as any, sub);
                }),
              );
            });
          }),
        );
        whereCondition = rest;
      }
    }

    Object.entries(whereCondition).forEach(([key, value]) => {
      // Convert dot notation like 'offering.agent.uId' to alias format: 'offering_agent.uId'
      const keyParts = key.split('.');
      const isNested = keyParts.length > 1;
      const column = keyParts.pop();
      const alias = isNested ? keyParts.join('_') : 'entity';
      const dbColumn = `${alias}.${column}`;
      const paramKey = key.replace(/\./g, '_'); // SQL parameter name must not contain dots


      // if (key === 'role') {
      //   if (Array.isArray(value)) {
      //     const conditions: string[] = [];
      //     const parameters: Record<string, any> = {};

      //     value.forEach((val, idx) => {
      //       const paramKey = `role_${idx}`;
      //       conditions.push(`FIND_IN_SET(:${paramKey}, entity.role)`);
      //       parameters[paramKey] = val;
      //     });

      //     queryBuilder.andWhere(conditions.join(' OR '), parameters);
      //   } else {
      //     queryBuilder.andWhere(`FIND_IN_SET(:role, entity.role)`, {
      //       role: value,
      //     });
      //   }
      // } else 


      if (InstanceChecker.isFindOperator(value)) {
        const { type, value: resolvedValue } = resolveFindOperator(value);

        if (type === 'in') {
          queryBuilder.andWhere(`${dbColumn} IN (:...${paramKey})`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'not') {
          console.log('resolvedValue', resolvedValue);

          if (Array.isArray(resolvedValue)) {
            // Include NULLs when using NOT IN so that NULL rows aren't excluded unintentionally
            queryBuilder.andWhere(`(${dbColumn} NOT IN (:...${paramKey}) OR ${dbColumn} IS NULL)`, {
              [paramKey]: resolvedValue,
            });
          } else {
            console.log('resolvedValue', resolvedValue);
            if (resolvedValue === null || resolvedValue === undefined) {
              queryBuilder.andWhere(`${dbColumn} IS NOT NULL`);
            } else {
              // Include NULLs when using <> so that NULL rows aren't excluded unintentionally
              queryBuilder.andWhere(`(${dbColumn} <> :${paramKey} OR ${dbColumn} IS NULL)`, {
                [paramKey]: resolvedValue,
              });
            }
          }
        } else if (type === 'lessThan') {
          queryBuilder.andWhere(`${dbColumn} < :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'moreThan') {
          queryBuilder.andWhere(`${dbColumn} > :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'lessThanOrEqual') {
          queryBuilder.andWhere(`${dbColumn} <= :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'moreThanOrEqual') {
          queryBuilder.andWhere(`${dbColumn} >= :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'between') {
          const fromKey = `${paramKey}_from`;
          const toKey = `${paramKey}_to`;
          const [from, to] = Array.isArray(resolvedValue) ? resolvedValue : [undefined, undefined];
          queryBuilder.andWhere(`${dbColumn} BETWEEN :${fromKey} AND :${toKey}`, {
            [fromKey]: from,
            [toKey]: to,
          });
        } else if (type === 'like') {
          queryBuilder.andWhere(`${dbColumn} LIKE :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'ilike') {
          // Portable ILIKE: lower(column) LIKE lower(value)
          const ilikeKey = `${paramKey}_ilike`;
          const val =
            typeof resolvedValue === 'string' ? resolvedValue.toLowerCase() : resolvedValue;
          queryBuilder.andWhere(`LOWER(${dbColumn}) LIKE :${ilikeKey}`, {
            [ilikeKey]: val,
          });
        } else if (type === 'isNull') {
          queryBuilder.andWhere(`${dbColumn} IS NULL`);
        } else if (type === 'arrayContains') {
          // Postgres: column @> value
          queryBuilder.andWhere(`${dbColumn} @> :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'arrayContainedBy') {
          // Postgres: column <@ value
          queryBuilder.andWhere(`${dbColumn} <@ :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'arrayOverlap') {
          // Postgres: column && value
          queryBuilder.andWhere(`${dbColumn} && :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'raw') {
          if (typeof resolvedValue === 'function') {
            const expr = resolvedValue(dbColumn);
            queryBuilder.andWhere(expr);
          } else if (typeof resolvedValue === 'string') {
            queryBuilder.andWhere(resolvedValue);
          } else {
            queryBuilder.andWhere(`${dbColumn} = :${paramKey}`, {
              [paramKey]: resolvedValue,
            });
          }
        } else if (type === 'and' || type === 'or') {
          const logicalMethod = type === 'and' ? 'andWhere' : 'orWhere';
          const parts = Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue];

          queryBuilder.andWhere(
            new Brackets(qb => {
              parts.forEach((part, idx) => {
                const subParamKey = `${paramKey}_${type}_${idx}`;
                if (InstanceChecker.isFindOperator(part)) {
                  const { type: subType, value: subValue } = resolveFindOperator(part);
                  if (subType === 'in') {
                    qb[logicalMethod](`${dbColumn} IN (:...${subParamKey})`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'not') {
                    if (Array.isArray(subValue)) {
                      qb[logicalMethod](`(${dbColumn} NOT IN (:...${subParamKey}) OR ${dbColumn} IS NULL)`, {
                        [subParamKey]: subValue,
                      });
                    } else {
                      if (subValue === null || subValue === undefined) {
                        qb[logicalMethod](`${dbColumn} IS NOT NULL`);
                      } else {
                        qb[logicalMethod](`(${dbColumn} != :${subParamKey} OR ${dbColumn} IS NULL)`, {
                          [subParamKey]: subValue,
                        });
                      }
                    }
                  } else if (subType === 'lessThan') {
                    qb[logicalMethod](`${dbColumn} < :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'moreThan') {
                    qb[logicalMethod](`${dbColumn} > :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'lessThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} <= :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'moreThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} >= :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'between') {
                    const fromKey = `${subParamKey}_from`;
                    const toKey = `${subParamKey}_to`;
                    const [from, to] = Array.isArray(subValue) ? subValue : [undefined, undefined];
                    qb[logicalMethod](`${dbColumn} BETWEEN :${fromKey} AND :${toKey}`, {
                      [fromKey]: from,
                      [toKey]: to,
                    });
                  } else if (subType === 'like') {
                    qb[logicalMethod](`${dbColumn} LIKE :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'ilike') {
                    const ilikeKey = `${subParamKey}_ilike`;
                    const val = typeof subValue === 'string' ? subValue.toLowerCase() : subValue;
                    qb[logicalMethod](`LOWER(${dbColumn}) LIKE :${ilikeKey}`, {
                      [ilikeKey]: val,
                    });
                  } else if (subType === 'isNull') {
                    qb[logicalMethod](`${dbColumn} IS NULL`);
                  } else if (subType === 'arrayContains') {
                    qb[logicalMethod](`${dbColumn} @> :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'arrayContainedBy') {
                    qb[logicalMethod](`${dbColumn} <@ :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'arrayOverlap') {
                    qb[logicalMethod](`${dbColumn} && :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'raw') {
                    if (typeof subValue === 'function') {
                      const expr = subValue(dbColumn);
                      qb[logicalMethod](expr);
                    } else if (typeof subValue === 'string') {
                      qb[logicalMethod](subValue);
                    } else {
                      qb[logicalMethod](`${dbColumn} = :${subParamKey}`, {
                        [subParamKey]: subValue,
                      });
                    }
                  } else {
                    qb[logicalMethod](`${dbColumn} = :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  }
                } else if (isSerializedFindOperator(part)) {
                  const { type: subType, value: subValue } = resolveSerializedFindOperator(part);
                  if (subType === 'in') {
                    qb[logicalMethod](`${dbColumn} IN (:...${subParamKey})`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'not') {
                    if (Array.isArray(subValue)) {
                      qb[logicalMethod](`(${dbColumn} NOT IN (:...${subParamKey}) OR ${dbColumn} IS NULL)`, {
                        [subParamKey]: subValue,
                      });
                    } else {
                      if (subValue === null || subValue === undefined) {
                        qb[logicalMethod](`${dbColumn} IS NOT NULL`);
                      } else {
                        qb[logicalMethod](`(${dbColumn} != :${subParamKey} OR ${dbColumn} IS NULL)`, {
                          [subParamKey]: subValue,
                        });
                      }
                    }
                  } else if (subType === 'lessThan') {
                    qb[logicalMethod](`${dbColumn} < :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'moreThan') {
                    qb[logicalMethod](`${dbColumn} > :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'lessThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} <= :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'moreThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} >= :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'between') {
                    const fromKey = `${subParamKey}_from`;
                    const toKey = `${subParamKey}_to`;
                    const [from, to] = Array.isArray(subValue) ? subValue : [undefined, undefined];
                    qb[logicalMethod](`${dbColumn} BETWEEN :${fromKey} AND :${toKey}`, {
                      [fromKey]: from,
                      [toKey]: to,
                    });
                  } else if (subType === 'like') {
                    qb[logicalMethod](`${dbColumn} LIKE :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'ilike') {
                    const ilikeKey = `${subParamKey}_ilike`;
                    const val = typeof subValue === 'string' ? subValue.toLowerCase() : subValue;
                    qb[logicalMethod](`LOWER(${dbColumn}) LIKE :${ilikeKey}`, {
                      [ilikeKey]: val,
                    });
                  } else if (subType === 'isNull') {
                    qb[logicalMethod](`${dbColumn} IS NULL`);
                  } else if (subType === 'arrayContains') {
                    qb[logicalMethod](`${dbColumn} @> :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'arrayContainedBy') {
                    qb[logicalMethod](`${dbColumn} <@ :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'arrayOverlap') {
                    qb[logicalMethod](`${dbColumn} && :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  } else if (subType === 'raw') {
                    if (typeof subValue === 'function') {
                      const expr = subValue(dbColumn);
                      qb[logicalMethod](expr);
                    } else if (typeof subValue === 'string') {
                      qb[logicalMethod](subValue);
                    } else {
                      qb[logicalMethod](`${dbColumn} = :${subParamKey}`, {
                        [subParamKey]: subValue,
                      });
                    }
                  } else {
                    qb[logicalMethod](`${dbColumn} = :${subParamKey}`, {
                      [subParamKey]: subValue,
                    });
                  }
                } else {
                  qb[logicalMethod](`${dbColumn} = :${subParamKey}`, {
                    [subParamKey]: part,
                  });
                }
              });
            }),
          );
        } else {
          if (resolvedValue === null || resolvedValue === undefined) {
            queryBuilder.andWhere(`${dbColumn} IS NULL`);
          } else {
            queryBuilder.andWhere(`${dbColumn} = :${paramKey}`, {
              [paramKey]: resolvedValue,
            });
          }
        }
      } else if (isSerializedFindOperator(value)) {
        const { type, value: resolvedValue } = resolveSerializedFindOperator(value);

        if (type === 'in') {
          queryBuilder.andWhere(`${dbColumn} IN (:...${paramKey})`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'not') {
          if (Array.isArray(resolvedValue)) {
            queryBuilder.andWhere(`(${dbColumn} NOT IN (:...${paramKey}) OR ${dbColumn} IS NULL)`, {
              [paramKey]: resolvedValue,
            });
          } else {
            if (resolvedValue === null || resolvedValue === undefined) {
              queryBuilder.andWhere(`${dbColumn} IS NOT NULL`);
            } else {
              queryBuilder.andWhere(`(${dbColumn} != :${paramKey} OR ${dbColumn} IS NULL)`, {
                [paramKey]: resolvedValue,
              });
            }
          }
        } else if (type === 'lessThan') {
          queryBuilder.andWhere(`${dbColumn} < :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'moreThan') {
          queryBuilder.andWhere(`${dbColumn} > :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'lessThanOrEqual') {
          queryBuilder.andWhere(`${dbColumn} <= :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'moreThanOrEqual') {
          queryBuilder.andWhere(`${dbColumn} >= :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'between') {
          const fromKey = `${paramKey}_from`;
          const toKey = `${paramKey}_to`;
          const [from, to] = Array.isArray(resolvedValue) ? resolvedValue : [undefined, undefined];
          queryBuilder.andWhere(`${dbColumn} BETWEEN :${fromKey} AND :${toKey}`, {
            [fromKey]: from,
            [toKey]: to,
          });
        } else if (type === 'like') {
          queryBuilder.andWhere(`${dbColumn} LIKE :${paramKey}`, {
            [paramKey]: resolvedValue,
          });
        } else if (type === 'ilike') {
          const ilikeKey = `${paramKey}_ilike`;
          const val = typeof resolvedValue === 'string' ? resolvedValue.toLowerCase() : resolvedValue;
          queryBuilder.andWhere(`LOWER(${dbColumn}) LIKE :${ilikeKey}`, {
            [ilikeKey]: val,
          });
        } else if (type === 'isNull') {
          queryBuilder.andWhere(`${dbColumn} IS NULL`);
        } else if (type === 'and' || type === 'or') {
          const logicalMethod = type === 'and' ? 'andWhere' : 'orWhere';
          const parts = Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue];
          queryBuilder.andWhere(
            new Brackets(qb => {
              parts.forEach((part, idx) => {
                const subParamKey = `${paramKey}_${type}_${idx}`;
                if (InstanceChecker.isFindOperator(part)) {
                  const { type: subType, value: subValue } = resolveFindOperator(part);
                  if (subType === 'in') {
                    qb[logicalMethod](`${dbColumn} IN (:...${subParamKey})`, { [subParamKey]: subValue });
                  } else if (subType === 'not') {
                    if (Array.isArray(subValue)) {
                      qb[logicalMethod](`(${dbColumn} NOT IN (:...${subParamKey}) OR ${dbColumn} IS NULL)`, { [subParamKey]: subValue });
                    } else {
                      if (subValue === null || subValue === undefined) {
                        qb[logicalMethod](`${dbColumn} IS NOT NULL`);
                      } else {
                        qb[logicalMethod](`(${dbColumn} != :${subParamKey} OR ${dbColumn} IS NULL)`, { [subParamKey]: subValue });
                      }
                    }
                  } else if (subType === 'lessThan') {
                    qb[logicalMethod](`${dbColumn} < :${subParamKey})`, { [subParamKey]: subValue });
                  } else if (subType === 'moreThan') {
                    qb[logicalMethod](`${dbColumn} > :${subParamKey})`, { [subParamKey]: subValue });
                  } else if (subType === 'lessThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} <= :${subParamKey})`, { [subParamKey]: subValue });
                  } else if (subType === 'moreThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} >= :${subParamKey})`, { [subParamKey]: subValue });
                  } else if (subType === 'between') {
                    const fromKey = `${subParamKey}_from`;
                    const toKey = `${subParamKey}_to`;
                    const [from, to] = Array.isArray(subValue) ? subValue : [undefined, undefined];
                    qb[logicalMethod](`${dbColumn} BETWEEN :${fromKey} AND :${toKey}`, { [fromKey]: from, [toKey]: to });
                  } else if (subType === 'like') {
                    qb[logicalMethod](`${dbColumn} LIKE :${subParamKey}`, { [subParamKey]: subValue });
                  } else if (subType === 'ilike') {
                    const ilikeKey = `${subParamKey}_ilike`;
                    const val = typeof subValue === 'string' ? subValue.toLowerCase() : subValue;
                    qb[logicalMethod](`LOWER(${dbColumn}) LIKE :${ilikeKey}`, { [ilikeKey]: val });
                  } else if (subType === 'isNull') {
                    qb[logicalMethod](`${dbColumn} IS NULL`);
                  } else {
                    qb[logicalMethod](`${dbColumn} = :${subParamKey}`, { [subParamKey]: subValue });
                  }
                } else if (isSerializedFindOperator(part)) {
                  const { type: subType, value: subValue } = resolveSerializedFindOperator(part);
                  if (subType === 'in') {
                    qb[logicalMethod](`${dbColumn} IN (:...${subParamKey})`, { [subParamKey]: subValue });
                  } else if (subType === 'not') {
                    if (Array.isArray(subValue)) {
                      qb[logicalMethod](`(${dbColumn} NOT IN (:...${subParamKey}) OR ${dbColumn} IS NULL)`, { [subParamKey]: subValue });
                    } else {
                      if (subValue === null || subValue === undefined) {
                        qb[logicalMethod](`${dbColumn} IS NOT NULL`);
                      } else {
                        qb[logicalMethod](`(${dbColumn} != :${subParamKey} OR ${dbColumn} IS NULL)`, { [subParamKey]: subValue });
                      }
                    }
                  } else if (subType === 'lessThan') {
                    qb[logicalMethod](`${dbColumn} < :${subParamKey}`, { [subParamKey]: subValue });
                  } else if (subType === 'moreThan') {
                    qb[logicalMethod](`${dbColumn} > :${subParamKey}`, { [subParamKey]: subValue });
                  } else if (subType === 'lessThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} <= :${subParamKey}`, { [subParamKey]: subValue });
                  } else if (subType === 'moreThanOrEqual') {
                    qb[logicalMethod](`${dbColumn} >= :${subParamKey}`, { [subParamKey]: subValue });
                  } else if (subType === 'between') {
                    const fromKey = `${subParamKey}_from`;
                    const toKey = `${subParamKey}_to`;
                    const [from, to] = Array.isArray(subValue) ? subValue : [undefined, undefined];
                    qb[logicalMethod](`${dbColumn} BETWEEN :${fromKey} AND :${toKey}`, { [fromKey]: from, [toKey]: to });
                  } else if (subType === 'like') {
                    qb[logicalMethod](`${dbColumn} LIKE :${subParamKey}`, { [subParamKey]: subValue });
                  } else if (subType === 'ilike') {
                    const ilikeKey = `${subParamKey}_ilike`;
                    const val = typeof subValue === 'string' ? subValue.toLowerCase() : subValue;
                    qb[logicalMethod](`LOWER(${dbColumn}) LIKE :${ilikeKey}`, { [ilikeKey]: val });
                  } else if (subType === 'isNull') {
                    qb[logicalMethod](`${dbColumn} IS NULL`);
                  } else {
                    qb[logicalMethod](`${dbColumn} = :${subParamKey}`, { [subParamKey]: subValue });
                  }
                } else {
                  qb[logicalMethod](`${dbColumn} = :${subParamKey}`, { [subParamKey]: part });
                }
              });
            }),
          );
        } else {
          if (resolvedValue === null || resolvedValue === undefined) {
            queryBuilder.andWhere(`${dbColumn} IS NULL`);
          } else {
            queryBuilder.andWhere(`${dbColumn} = :${paramKey}`, { [paramKey]: resolvedValue });
          }
        }
      } else if (Array.isArray(value)) {
        queryBuilder.andWhere(`${dbColumn} IN (:...${paramKey})`, {
          [paramKey]: value,
        });
      } else if (value !== null && typeof value === 'object') {
        // Avoid comparing columns to plain objects accidentally (e.g., serialized operators lost)
        // If it's an unrecognized object, skip applying this filter to prevent zero-result bugs
        return;
      } else {
        if (value === null || value === undefined) {
          queryBuilder.andWhere(`${dbColumn} IS NULL`);
        } else {
          queryBuilder.andWhere(`${dbColumn} = :${paramKey}`, {
            [paramKey]: value,
          });
        }
      }
    });
  }

  async fetchAllPaginated<T>(
    fetchFunction: (page: number, limit: number, whereCondition?: any) => Promise<any>,
    whereCondition?: any,
    pageSize = 1000,
  ): Promise<T[]> {
    let currentPage = 1;
    let hasNextPage = true;
    const allDocs: T[] = [];

    while (hasNextPage) {
      const result = await fetchFunction(currentPage, pageSize, whereCondition);
      allDocs.push(...(result.docs || []));

      const totalPages = result.totalPages || 1;
      hasNextPage = currentPage < totalPages;
      currentPage++;
    }

    return allDocs;
  }
}