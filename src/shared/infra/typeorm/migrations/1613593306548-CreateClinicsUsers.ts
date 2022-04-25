import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm'

export class CreateClinicsUsers1613593306548 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users_clinics',
        columns: [
          {
            name: 'user_id',
            type: 'uuid'
          },
          {
            name: 'clinic_id',
            type: 'uuid'
          }
        ]
      })
    )

    await queryRunner.createForeignKey(
      'users_clinics',
      new TableForeignKey({
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        columnNames: ['user_id'],
        name: 'fk_users_clinics',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    )

    await queryRunner.createForeignKey(
      'users_clinics',
      new TableForeignKey({
        referencedTableName: 'clinics',
        referencedColumnNames: ['id'],
        columnNames: ['clinic_id'],
        name: 'fk_clinics_users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users_clinics', 'fk_clinics_users')

    await queryRunner.dropForeignKey('users_clinics', 'fk_users_clinics')

    await queryRunner.dropTable('users_clinics')
  }
}
