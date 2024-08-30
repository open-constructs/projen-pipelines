import { JobPermission, JobPermissions } from 'projen/lib/github/workflows-model';
import { getBroadestPermission, mergeJobPermissions } from '../src/engines/github';

describe('getBroadestPermission', () => {
  it('should return the broadest permission', () => {
    expect(getBroadestPermission(JobPermission.READ, JobPermission.WRITE, JobPermission.NONE)).toBe(JobPermission.WRITE);
    expect(getBroadestPermission(JobPermission.READ, JobPermission.WRITE)).toBe(JobPermission.WRITE);
    expect(getBroadestPermission(JobPermission.READ, JobPermission.NONE)).toBe(JobPermission.READ);
    expect(getBroadestPermission(JobPermission.WRITE, JobPermission.NONE)).toBe(JobPermission.WRITE);
    expect(getBroadestPermission(JobPermission.NONE)).toBe(JobPermission.NONE);
  });

  it('should throw an error if no permissions are provided', () => {
    expect(() => getBroadestPermission()).toThrowError();
  });

  it('should throw an error if an invalid permission is provided', () => {
    expect(() => getBroadestPermission(JobPermission.READ, JobPermission.WRITE, 'invalid' as JobPermission)).toThrowError();
  });
});

describe('mergeJobPermissions', () => {
  it('should merge permissions correctly', () => {
    const first: JobPermissions = {
      contents: JobPermission.WRITE,
      pages: JobPermission.READ,
      deployments: JobPermission.NONE,
    };

    const second: JobPermissions = {
      idToken: JobPermission.WRITE,
      contents: JobPermission.NONE,
      pages: JobPermission.NONE,
      deployments: JobPermission.WRITE,
    };

    const third: JobPermissions = {
      idToken: JobPermission.WRITE,
      contents: JobPermission.READ,
      issues: JobPermission.WRITE,
    };

    const result = mergeJobPermissions(first, second, third);

    expect(result).toEqual({
      contents: JobPermission.WRITE,
      pages: JobPermission.READ,
      deployments: JobPermission.WRITE,
      idToken: JobPermission.WRITE,
      issues: JobPermission.WRITE,
    });
  });
});