import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import styles from "./app.module.css";
import { useRoutes } from "./redux/hooks/use-routes";
import * as Pages from "./components/pages/pages";

type PageComponentName = keyof typeof Pages;

const App: React.FC = () => {
  const { routes, isLoading, error, fetchRoutes } = useRoutes();

  useEffect(() => {
    if (!isLoading && !error) {
      fetchRoutes();
    }
  }, []);

  if (isLoading) {
    return (
      <BrowserRouter basename="/">
        <div className={styles.container}>
          <CircularProgress />
        </div>
      </BrowserRouter>
    );
  }

  if (error) {
    return (
      <BrowserRouter basename="/">
        <div className={styles.container}>
          <Typography color="error">{error}</Typography>
          <Button onClick={fetchRoutes}>Retry</Button>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter basename="/">
      <div className={styles.container}>
        <Routes>
          {routes.map((route) => {
            const componentName = route.component as PageComponentName;
            if (!(componentName in Pages)) return null;
            const Component = Pages[componentName];
            if (!Component) return null;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Component />}
              />
            );
          })}
          <Route path="/Complex/" element={<Pages.ActionTypes />} />
          <Route path="/Complex" element={<Pages.ComplexHabits />} />
          <Route path="/WithoutIntervals" element={<Pages.WithoutIntervalsHabits />} />
          <Route
            path="/"
            element={
              <>
                <Pages.CreateHabits />
                <Pages.HabitsSelection />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
