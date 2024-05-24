export interface ListItem {
  value: string
  label: string
}

export interface MenuItem {
  id: string
  name: string
  icon?: string
  children?: MenuItem[]
}

export type IWorkspace = {
  id?: string,
  name: string,
  description: string,
  members: IMember[]
}
export type IMember = {
  userId: string,
  username: string,
  role: string
}

export enum SpaceType {
  Personal = 'personal',
  Group = 'group',
  Teamwork = 'teamwork' 
}
export enum UserRole {
  Admin = 'admin',
  Member = 'user'
}

// 定义角色标签映射对象
export const roleLabels: Record<UserRole, string> = {
  [UserRole.Admin]: '管理员',
  [UserRole.Member]: "成员"
};

export enum SurveyPermissions {
  SurveyManage = 'surveyManage',
  DataManage = 'dataManage',
  CollaboratorManage = 'collaboratorManage'
}
// 定义协作者权限标签映射对象
export const surveyPermissionsLabels: Record<SurveyPermissions, string> = {
  [SurveyPermissions.SurveyManage]: '问卷管理',
  [SurveyPermissions.DataManage]: '数据管理',
  [SurveyPermissions.CollaboratorManage]: '协作者管理'
};
