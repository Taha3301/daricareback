import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvisTable1741772944000 implements MigrationInterface {
  name = 'CreateAvisTable1741772944000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "avis" (
        "id"              SERIAL PRIMARY KEY,
        "rating"          INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
        "comment"         TEXT,
        "title"           VARCHAR(100),
        "wouldRecommend"  BOOLEAN,
        "isApproved"      BOOLEAN NOT NULL DEFAULT false,
        "createdAt"       TIMESTAMP NOT NULL DEFAULT now(),
        "patient_id"      INTEGER NOT NULL UNIQUE,
        CONSTRAINT "FK_avis_patient"
          FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id")
          ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "avis";`);
  }
}
