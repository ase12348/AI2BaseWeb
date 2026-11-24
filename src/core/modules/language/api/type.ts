import { defHttp, useCURD } from '/@/core/utils/http/axios';

import module from '../module';

export interface LgTypeEntity {
  f_Id: string;
  f_Name: string;
  f_Code: string;
  f_IsMain: number;
}

const urlPrefix = `${module.code}/type`;
const crud = useCURD<LgTypeEntity>(urlPrefix);
crud.getList = () =>
  defHttp.get<LgTypeEntity[]>(
    {
      url: `language/types`,
    },
    { withToken: false },
  );
export const api = {
  ...crud,
};
