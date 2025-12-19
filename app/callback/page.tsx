// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { toast, Toaster } from "sonner";

// export default function SpotifyCallback() {
//   const router = useRouter();

//   useEffect(() => {
//     const handleCallback = () => {
//       const queryString = window.location.search; // ✅ Correct for auth code
//       const params = new URLSearchParams(queryString);
//       const code = params.get("code");
//       const error = params.get("error");
//   console.log(code)
//       if (code) {
//         localStorage.setItem("spotifyAccessToken", code); // ⬅️ Save the code
//         toast.success("Successfully connected to Spotify!");
//         router.push("/"); // Or send to backend to exchange for token
//       } else if (error) {
//         console.error("Spotify authentication error:", error);
//         toast.error("Failed to connect to Spotify. Please try again.");
//         router.push("/");
//       } else {
//         console.error("No code or error found in URL");
//         toast.error("Something went wrong. Please try again.");
//         router.push("/");
//       }
//     };
  
//     handleCallback();
//   }, [router]);
  

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900">
//       <Toaster
//         position="bottom-center"
//         toastOptions={{
//           style: {
//             background: "#1F2937",
//             color: "#F3F4F6",
//             border: "1px solid #374151",
//           },
//         }}
//       />
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500 mx-auto"></div>
//         <h2 className="mt-4 text-xl font-semibold text-gray-200">
//           Connecting to Spotify...
//         </h2>
//       </div>
//     </div>
//   );
// }
