import { useEffect } from "react";
import { Can } from "../features/auth/components";
import { useAuth } from "../features/auth/contexts/AuthContext";
import { useCan } from "../features/auth/hooks/useCan";
import { withSSRAuth } from "../features/auth/utils/withSSRAuth";
import { api } from "../services/api";
import { setupApiClient } from "../services/api/setupApiClient";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const userCanSeeMetrics = useCan({
    roles: ["administrator", "editor"],
  });

  useEffect(() => {
    api
      .get("/me")
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
      <Can permissions={["metrics.list"]}>
        <div>Metrics</div>
      </Can>
    </>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);
  const response = await apiClient.get("/me");
  return {
    props: {},
  };
});

export default Dashboard;
