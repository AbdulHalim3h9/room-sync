// import { useState } from "react";
// import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/firebase";

// const PhoneAuth = () => {
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [confirmationResult, setConfirmationResult] = useState(null);
//   const [user, setUser] = useState(null);

//   const sendOTP = async () => {
//     try {
//       if (!window.recaptchaVerifier) {
//         window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
//           size: "normal", // Change from "invisible" to "normal"
//           callback: (response) => {
//             console.log("reCAPTCHA verified!");
//           },
//         });
//         await window.recaptchaVerifier.render();
//       }
  
//       const appVerifier = window.recaptchaVerifier;
//       const result = await signInWithPhoneNumber(auth, phone, appVerifier);
//       setConfirmationResult(result);
//       alert("OTP Sent!");
//     } catch (error) {
//       console.error(error);
//       alert("Error sending OTP: " + error.message);
//     }
//   };
  
//   const verifyOTP = async () => {
//     try {
//       const result = await confirmationResult.confirm(otp);
//       setUser(result.user);
//       alert("Phone verified successfully!");
//     } catch (error) {
//       alert("Invalid OTP");
//     }
//   };

//   return (
//     <div>
//       <div id="recaptcha-container"></div>

//       {!user ? (
//         <>
//           <input
//             type="tel"
//             placeholder="Enter phone number"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//           />
//           <button onClick={sendOTP}>Send OTP</button>

//           <input
//             type="text"
//             placeholder="Enter OTP"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//           />
//           <button onClick={verifyOTP}>Verify OTP</button>
//         </>
//       ) : (
//         <h3>Welcome, {user.phoneNumber}</h3>
//       )}
//     </div>
//   );
// };

// export default PhoneAuth;
