import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateUserAddress1613593216597 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_address',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'cep',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'street',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'neighborhood',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'number',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'state',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_address')
  }
}
