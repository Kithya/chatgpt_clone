import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Loading = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { fetchUser, axios, token } = useAppContext();

  useEffect(() => {
    if (pathname !== "/loading") return;

    const verifyAndRedirect = async () => {
      try {
        const sessionId = new URLSearchParams(window.location.search).get(
          "session_id",
        );

        if (sessionId && token) {
          const { data } = await axios.post(
            "/api/credit/verify",
            { sessionId },
            { headers: { Authorization: token } },
          );

          if (!data.success) {
            toast.error(data.message || "Payment verification pending");
          }
        }

        await fetchUser();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Payment verification failed");
      } finally {
        navigate("/", { replace: true });
      }
    };

    verifyAndRedirect();
  }, [axios, fetchUser, navigate, pathname, token]);

  return (
    <div className="bg-linear-to-b from-[#531B81] to-[#29184B] backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-white text-2xl">
      <div className="w-10 h-10 rounded-full border-3 border-white border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Loading;
