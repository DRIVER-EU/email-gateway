REM https://github.com/DRIVER-EU/avro-typescript-converter

@echo off

echo "Are the AVRO in sync with https://github.com/DRIVER-EU/avro-schemas.git "

call npm i -g avro-typescript-converter

echo Create TypeScript based on AVRO schema's.
call avro-typescript-converter -i avro-schemas/sim/entity/simulation_entity_post-value.avsc -o ./../src/models/avro_generated/
pause