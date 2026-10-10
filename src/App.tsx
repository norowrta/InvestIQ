import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/header/Header";

export default function App() {
  return (
    <>
      <div className="bgContainer">
        <div className="bg3"></div>
        <div className="bg2"></div>
        <div className="bg1"></div>
      </div>

      <Header />
      <main>
        <Outlet />
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <ToastContainer />
    </>
  );
}
