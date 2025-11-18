import { Controller } from '@nestjs/common';
import { ApiProjectsController } from './projects.swagger';

@ApiProjectsController()
@Controller('projects')
export class ProjectsController {
	// Intentionally left without public routes; admin handles creation and updates
}


