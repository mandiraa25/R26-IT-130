const Student = require("../../common/models/student.model");

const isStudentRequest = (req) =>
  req?.user?.role === "student" || req?.user?.type === "student";

const isSuperAdminRequest = (req) =>
  req?.user?.role === "super admin";

const isGuardianRequest = (req) =>
  req?.user?.role === "guardian" || req?.user?.type === "guardian";

const isAdminRequest = (req) =>
  !isGuardianRequest(req) &&
  (req?.user?.type === "admin" ||
   req?.user?.role === "school admin" ||
   req?.user?.role === "super admin");

const canAccessChild = (req, child) => {
  if (!child) return false;

  const childId = String(child._id || child.id || child);

  if (isSuperAdminRequest(req)) {
    return true;
  }

  if (isStudentRequest(req)) {
    return childId === String(req.user.id);
  }

  if (isGuardianRequest(req)) {
    const guardianId = String(req.user.id);
    return (
      String(child.guardianId) === guardianId ||
      String(child.createdByAdmin) === guardianId
    );
  }

  if (isAdminRequest(req)) {
    return true;
  }

  return false;
};

const getGuardianChildIds = async (req) => {
  if (isSuperAdminRequest(req)) {
    return null;
  }

  if (isStudentRequest(req)) {
    return [req.user.id];
  }

  if (isGuardianRequest(req)) {
    const students = await Student.find({
      $or: [{ guardianId: req.user.id }, { createdByAdmin: req.user.id }],
    }).select("_id");
    return students.map((s) => s._id);
  }

  if (isAdminRequest(req)) {
    return null;
  }

  return [];
};

const assertStudentActive = (child) => {
  if (!child) return false;
  if (typeof child.isActive === "boolean") {
    return child.isActive !== false;
  }
  return child.accountStatus !== "inactive";
};

module.exports = {
  isStudentRequest,
  isAdminRequest,
  isSuperAdminRequest,
  canAccessChild,
  getGuardianChildIds,
  assertStudentActive,
};
