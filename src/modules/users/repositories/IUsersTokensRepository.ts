import ICreateUsersTokensDTO from '../dtos/ICreateUsersTokensDTO'
import UserToken from '../infra/typeorm/entities/UserToken'

export default interface IUsersTokensRepository {
  create({
    expires_date,
    refresh_token,
    user_id
  }: ICreateUsersTokensDTO): Promise<UserToken>
  findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserToken | undefined>
  findByRefreshToken(refresh_token: string): Promise<UserToken | undefined>
  deleteById(id: string): Promise<void>
}
