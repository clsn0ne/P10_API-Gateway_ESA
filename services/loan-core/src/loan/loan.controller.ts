import { Controller, Post, Body, Get, Param, NotFoundException, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { LoanSaga } from './loan.saga';

@Controller('loans')
export class LoanController {
  constructor(private readonly saga: LoanSaga) {}

  @Post('apply')
  async apply(@Body() dto: any) {
    return this.saga.execute(dto);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'loan-core' };
  }

  @Get(':id')
  async getLoan(@Param('id') id: string) {
    return this.saga.getLoan(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLoan(@Param('id') id: string): void {
    this.saga.deleteLoan(id);
  }
}
