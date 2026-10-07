export const permissions = {
  STUDENT: ['profile:read','subjects:read','grades:read:self','attendance:read:self','tasks:read','intelligence:read:self'],
  TEACHER: ['profile:read','groups:read:assigned','grades:write:assigned','attendance:write:assigned','tasks:write:assigned','intelligence:read:assigned'],
  ADMIN: ['users:manage','groups:manage','subjects:manage','cycles:manage','assignments:manage','audit:read','intelligence:read:school'],
  TUTOR: ['students:read:linked','grades:read:linked','attendance:read:linked','reports:read:linked','intelligence:read:linked'],
};
