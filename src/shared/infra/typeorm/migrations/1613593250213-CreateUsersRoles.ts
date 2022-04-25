import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm'

export class CreateUsersRoles1613593250213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users_roles',
        columns: [
          {
            name: 'user_id',
            type: 'uuid'
          },
          {
            name: 'role_id',
            type: 'uuid'
          }
        ]
      })
    )

    await queryRunner.createForeignKey(
      'users_roles',
      new TableForeignKey({
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        columnNames: ['user_id'],
        name: 'fk_users_roles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    )

    await queryRunner.createForeignKey(
      'users_roles',
      new TableForeignKey({
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        columnNames: ['role_id'],
        name: 'fk_roles_users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users_roles', 'fk_roles_users')

    await queryRunner.dropForeignKey('users_roles', 'fk_users_roles')

    await queryRunner.dropTable('users_roles')
  }
}
