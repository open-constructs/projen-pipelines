import { JobPermission, JobPermissions } from 'projen/lib/github/workflows-model';

/**
 * Merge multiple GitHub JobPermissions. The broader permission per use case will win
 *
 * @param permissions the permissions to merge
 * @return the merged permission
 */
export function mergeJobPermissions(...perms: JobPermissions[]): JobPermissions {
  const permissions: { [key: string]: JobPermission } = { ...perms[0] };

  for (const permission of perms.slice(1)) {
    for (const [key, value] of Object.entries(permission)) {
      permissions[key] = getBroadestPermission(value, permissions[key] ?? JobPermission.NONE);
    }
  }

  return permissions;
}

/**
 * Merge two GitHub JobPermission values. The broader permission will win
 *
 * @param perms the permissions to merge
 * @return the broadest permission
 */
export function getBroadestPermission(...perms: JobPermission[]): JobPermission {
  if (!perms || perms.length === 0) {
    throw new Error('No permissions provided');
  }
  for (const perm of perms) {
    if (!Object.values(JobPermission).includes(perm)) {
      throw new Error(`Invalid permission value: ${perm}`);
    }
  }

  if (perms.includes(JobPermission.WRITE)) {
    return JobPermission.WRITE;
  }
  if (perms.includes(JobPermission.READ)) {
    return JobPermission.READ;
  }
  return JobPermission.NONE;
}
