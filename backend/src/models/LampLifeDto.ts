// backend/src/models/LampLifeDto.ts
export class LampLifeDto {
  eqpId: string;
  lampId: string;
  servTs: string | null;
  ageHour: number | null;
  lifespanHour: number | null;
  lastChanged: string | null;
}
