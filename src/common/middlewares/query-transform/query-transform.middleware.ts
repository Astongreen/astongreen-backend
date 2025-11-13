import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as moment from 'moment';

@Injectable()
export class QueryTransformMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let { page, limit, startDate, endDate, search } = req.query;

    // Convert page and limit to valid numbers, then store them as strings
    const parsedPage = page ? Math.max(1, Number(page)) : 1;
    const parsedLimit = limit ? Math.max(1, Number(limit)) : 10;

    // Handle search parameter transformations
    let processedSearch = '';
    if (search) {
      // Convert search to string
      processedSearch = String(search);
      // Remove '+' from start and end
      processedSearch = processedSearch.replace(/^\+|\+$/g, '');
      // Replace '+' with spaces in the middle
      if (processedSearch.length > 0) {
        processedSearch = processedSearch
          .split('')
          .map((char, index, arr) => {
            // Replace '+' with space only if it's not at start or end
            if (char === '+' && index > 0 && index < arr.length - 1) {
              return ' ';
            }
            return char;
          })
          .join('');
      }
    }
    // Create a new object to hold the modified query parameters
    (req as any)['modifiedQuery'] = {
      page: String(parsedPage), // Override with the updated page
      limit: String(parsedLimit), // Override with the updated limit
      search: processedSearch.trim(),
    };

    // Validate startDate and endDate if present
    if (startDate && !moment.unix(parseInt(startDate as string)).isValid()) {
      throw new BadRequestException('Invalid startDate format');
    }
    if (endDate && !moment.unix(parseInt(endDate as string)).isValid()) {
      throw new BadRequestException('Invalid endDate format');
    }
    if (startDate && endDate) {
      (req as any)['modifiedQuery'] = {
        ...(req as any)['modifiedQuery'],
        startDate: moment.unix(parseInt(startDate as string)).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment.unix(parseInt(endDate as string)).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      };
    }

    next();
  }
}
