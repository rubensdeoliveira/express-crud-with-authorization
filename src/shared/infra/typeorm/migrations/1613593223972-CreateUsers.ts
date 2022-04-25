import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateUsers1613593223972 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'name',
            type: 'varchar'
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'birthdate',
            type: 'date'
          },
          {
            name: 'phone',
            type: 'varchar'
          },
          {
            name: 'cpf',
            type: 'varchar'
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'password',
            type: 'varchar'
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true
          },
          {
            name: 'owner_id',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'address_id',
            type: 'uuid',
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
        ],
        foreignKeys: [
          {
            name: 'fk_user_owner',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['owner_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          {
            name: 'fk_user_address',
            referencedTableName: 'user_address',
            referencedColumnNames: ['id'],
            columnNames: ['address_id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
          }
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'fk_user_address')

    await queryRunner.dropForeignKey('users', 'fk_user_owner')

    await queryRunner.dropTable('users')
  }
}
