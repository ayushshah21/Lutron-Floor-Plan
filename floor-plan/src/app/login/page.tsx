"use client";

import { signInWithPopup } from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "../../../firebase";
import Image from "next/image";
import styles from './login.module.css';

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

	// Removes the white border around the login page
	useEffect(() => {
		document.body.style.margin = "0";
		document.body.style.padding = "0";
		document.body.style.boxSizing = "border-box";
		document.body.style.background = "radial-gradient(circle, #1E75BB 0%, #00457C 100%)";
	
		return () => {
		  document.body.style.margin = "";
		  document.body.style.padding = "";
		  document.body.style.boxSizing = "";
		  document.body.style.background = "";
		};
	  }, []);

	return (
		<div className={styles.loginWrapper}>
			<div className={styles.loginBox} id="loginBox">
				<Image
					src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
					alt="Lutron-logo"
					width={150}
					height={25}
					className={styles.lutronLogo}
				/>
				<h3>Sign In</h3>
				<p>with your Gmail account</p>
				<button className={styles.button} onClick={signInWithGoogle} id="loginButton">
					Google Login
				</button>
				<div className={styles.footer}>
					<a href="http://www.lutron.com/myLutronPrivacyNotice">Privacy Notice</a> /
					<a href="http://www.lutron.com/myLutronCookieNotice">Cookie Notice</a> /
					<a href="mailto:mylutronsupport@lutron.com">Support</a>
				</div>
			</div>
		</div>
	);
}
