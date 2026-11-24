import { useGlobSetting } from '/@/core/hooks/setting';

const { options: webCofing } = useGlobSetting();

export const getRedirectData = (redirectPath: string) => {
  const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
    path: webCofing.loginPage.url,
    replace: true,
  };
  if (redirectPath) {
    redirectData.query = {
      ...redirectData.query,
      redirect: redirectPath,
    };
  }
  return redirectData;
};
