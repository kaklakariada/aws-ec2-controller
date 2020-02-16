import environment from "../environment";

export class EnvironmentService {
  getUserPoolId(): string {
    return environment.amplifyConfig.Auth.userPoolId;
  }

  getRegion(): string {
    return environment.region;
  }
}
