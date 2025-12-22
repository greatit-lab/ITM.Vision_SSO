// backend/src/admin/dto/admin.dto.ts
export class CreateAdminDto {
  loginId: string;
  role: string;
  assignedBy?: string; // [수정] Optional로 변경하여 안전성 확보
}

export class CreateAccessCodeDto {
  compid: string;
  deptid: string;
  description?: string;
  isActive?: string;
}

export class UpdateAccessCodeDto {
  deptid: string;
  description?: string;
  isActive?: string;
}

export class CreateGuestDto {
  loginId: string;
  requester?: string;
  grantedRole?: string;
  validUntil: string | Date;
  reason?: string;
}
