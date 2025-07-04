import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service'
import { JwtAdminGuard } from '../../auth/guards/jwt-admin.guard';

@Controller('estadisticas')
@UseGuards(JwtAdminGuard)
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  // 1) Cantidad de publicaciones por usuario en rango
  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  // 2) Cantidad total de comentarios en rango
  @Get('comentarios-totales')
  async comentariosTotales(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosTotales(desde, hasta);
  }

  // 3) Cantidad de comentarios por publicación en rango
  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}