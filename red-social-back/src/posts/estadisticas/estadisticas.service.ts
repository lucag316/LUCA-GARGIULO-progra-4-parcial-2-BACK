
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  // 1) Cantidad publicaciones por usuario en rango
  async publicacionesPorUsuario(desde: string, hasta: string) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    // Agrupa por autor contando publicaciones dentro del rango
    return this.postModel.aggregate([
      {
        $match: {
          createdAt: { $gte: fechaDesde, $lte: fechaHasta },
          estaEliminado: false,
        },
      },
      {
        $group: {
          _id: '$autor',
          totalPublicaciones: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users', // nombre colección usuarios en Mongo
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      {
        $unwind: '$usuario',
      },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombre: '$usuario.nombre',
          apellido: '$usuario.apellido',
          totalPublicaciones: 1,
        },
      },
    ]);
  }

  // 2) Cantidad total de comentarios en rango
  async comentariosTotales(desde: string, hasta: string) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    const resultado = await this.postModel.aggregate([
      { $unwind: '$comentarios' },
      {
        $match: {
          'comentarios.fechaCreacion': {
            $gte: fechaDesde,
            $lte: fechaHasta,
          },
          estaEliminado: false,
        },
      },
      {
        $count: 'totalComentarios',
      },
    ]);

    return resultado.length > 0 ? resultado[0].totalComentarios : 0;
  }

  // 3) Cantidad de comentarios por publicación en rango
  async comentariosPorPublicacion(desde: string, hasta: string) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    return this.postModel.aggregate([
      { $unwind: '$comentarios' },
      {
        $match: {
          'comentarios.fechaCreacion': {
            $gte: fechaDesde,
            $lte: fechaHasta,
          },
          estaEliminado: false,
        },
      },
      {
        $group: {
          _id: '$_id',
          titulo: { $first: '$titulo' },
          totalComentarios: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: 1,
          totalComentarios: 1,
        },
      },
    ]);
  }
}