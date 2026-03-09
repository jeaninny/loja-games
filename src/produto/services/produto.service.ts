import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Produto } from "../entities/produto.entity";
import { DeleteResult, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { CategoriaService } from "../../categoria/services/categoria.service";

@Injectable()
export class ProdutoService {

    constructor(
        @InjectRepository(Produto)
        private produtoRepository: Repository<Produto>,
        private readonly categoriaService: CategoriaService
    ) { }

    async findAll(): Promise<Produto[]> {
        // SELECT * FROM tb_produtos

        return this.produtoRepository.find({
            relations: {
                categoria: true
            }
        });
    }

    async findById(id: number): Promise<Produto> {
        // SELECT * FROM tb_produtos WHERE id = ?

        const produto = await this.produtoRepository.findOne({
            where: {
                id,
            },
            relations: {
                categoria: true
            }
        })
        if (!produto) {
            throw new HttpException("Produto não encontrado!", HttpStatus.NOT_FOUND)
        }
        return produto;

    }

    async findAllByNome(nome: string): Promise<Produto[]> {
        // SELECT * FROM tb_produtos WHERE nome LIKE '%?%'
        return this.produtoRepository.find({
            where: {
                nome: ILike(`%${nome}%`),
            },
            relations: {
                categoria: true
            }
        })
    }

    // CONSULTA EXTRA 1: Produtos acima ou igual a determinado preço

    async findAllByPrecoMin(preco: number): Promise<Produto[]> {
        // SELECT * FROM tb_produtos WHERE preco >= ?

        return this.produtoRepository.find({
            where: {
                preco: MoreThanOrEqual(preco),
            },
            order: {
                preco: "ASC", // Ordena em ordem crescente de preco
            }
        })
    }

    // CONSULTA EXTRA 2: Produtos abaixo ou igual a determinado preço

    async findAllByPrecoMax(preco: number): Promise<Produto[]> {
        // SELECT * FROM tb_produtos WHERE preco <= ?
        return this.produtoRepository.find({
            where: {
                preco: LessThanOrEqual(preco),
            },
            order: {
                preco: "DESC", // Ordena em ordem decrescente de preco
            }
        })
    }


    async create(produto: Produto): Promise<Produto> {
        // Checa se foi passado id de Categoria e se a Categoria do Produto existe
        if (produto.categoria?.id) {
            await this.categoriaService.findById(produto.categoria.id);
        }

        // INSERT INTO tb_produtos (nome, preco, foto, categoriaId?) VALUES (?, ?, ?, ?);
        return await this.produtoRepository.save(produto);
    }

    async update(produto: Produto): Promise<Produto> {

        if (!produto.id || produto.id <= 0) {
            throw new HttpException("O ID do produto é inválido!", HttpStatus.BAD_REQUEST);
        }

        // Checa se o Produto existe
        await this.findById(produto.id);

        // Checa se foi passado id de Categoria e se a Categoria do Produto existe
        if (produto.categoria?.id) {
            await this.categoriaService.findById(produto.categoria.id);
        }

        // UPDATE tb_produtos
        // SET nome = ?
        // preco = ?
        // foto = ?
        // categoriaId? = ?
        // WHERE id = ?
        return await this.produtoRepository.save(produto);
    }

    async delete(id: number): Promise<DeleteResult> {

        // Checa se o Produto existe
        await this.findById(id);

        // DELETE tb_produtos WHERE id = ?
        return await this.produtoRepository.delete(id);
    }
}