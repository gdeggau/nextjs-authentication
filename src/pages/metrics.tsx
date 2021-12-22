import { withSSRAuth } from "../features/auth/utils/withSSRAuth";
import { setupAPIClient } from "../services/api";

const Metrics = () => {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
};

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx);
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
