"use client";

import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "../../../firebase";
import Image from "next/image";
import './login.css';

export default function Login() {
	const router = useRouter();

	const signInWithGoogle = async () => {
		try {
			await signInWithPopup(auth, googleProvider);
			router.push("/home");
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<main className="main">
			<div className="loginBox" id="loginBox">
				<Image
					src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
					alt="Lutron-logo"
					width={150}
					height={25}
					className="lutronLogo"
				/>
				<h3>Sign In</h3>
				<p>with your gmail account</p>
				<button className="button" onClick={signInWithGoogle} id="loginButton">
					Google Login
				</button>
				<div className="footer">
					<div>
						<a href="http://www.lutron.com/myLutronPrivacyNotice">Privacy Notice</a> / 
						<a href="http://www.lutron.com/myLutronCookieNotice">Cookie Notice</a> / 
						<a href="mailto:mylutronsupport@lutron.com">Support</a>
					</div>
				</div>
			</div>
		</main>
	);
}
