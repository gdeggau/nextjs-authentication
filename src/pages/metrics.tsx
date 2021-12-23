import { withSSRAuth } from "@features/auth";
import { setupApiClient } from "@services/api/setupApiClient";

const Metrics = () => {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
};

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupApiClient(ctx);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);

export default Metrics;
