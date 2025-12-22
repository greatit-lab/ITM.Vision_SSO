// frontend/src/api/admin.ts
import http from "./http";

// 1. Users
export const getUsers = () => http.get("/admin/users");

// 2. Admins
export const getAdmins = () => http.get("/admin/admins");
export const addAdmin = (data: any) => http.post("/admin/admins", data);
export const deleteAdmin = (id: string) => http.delete(`/admin/admins/${id}`);

// 3. Access Codes
export const getAccessCodes = () => http.get("/admin/access-codes");
export const createAccessCode = (data: any) =>
  http.post("/admin/access-codes", data);
export const updateAccessCode = (id: string, data: any) =>
  http.put(`/admin/access-codes/${id}`, data);
export const deleteAccessCode = (id: string) =>
  http.delete(`/admin/access-codes/${id}`);

// 4. Guests
export const getGuests = () => http.get("/admin/guests");
export const addGuest = (data: any) => http.post("/admin/guests", data);
export const deleteGuest = (id: string) => http.delete(`/admin/guests/${id}`);

// 5. Equipments (ref_equipment)
export const getRefEquipments = () => http.get("/admin/equipments");
