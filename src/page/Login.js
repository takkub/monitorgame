import React, {useEffect, useContext} from 'react';
import { Button } from 'antd';
import authContext from '../context/Auth';
import { useHistory, useLocation } from "react-router-dom";
import * as waxjs from "@waxio/waxjs/dist";

const Login = () => {
    let auth = useContext(authContext);
    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/" } };
    
    // const handleLogin = event => {
    //     if (event?.data?.userAccount && event?.data?.pubKeys) {
    //         console.log('message window', event)
    //         auth.isLogin = true;
    //         auth.account = event.data.userAccount;
    //         auth.publicKey = event.data.pubKeys;
    //         console.log(auth);
    //         // history.push("/");
    //         history.replace(from)
    //     }
    // }

    const handlePopup = async () => {
        try {
            const wax = new waxjs.WaxJS('https://api.waxsweden.org');
            const user = await wax.login();
            auth.publicKey = user.pubKeys;
            auth.userAccount = user.userAccount;
            auth.isLogin = true;
            history.replace(from)
            
        } catch (e) {
            console.log('Fail Login');
        }
    }
    
    useEffect(() => {
        handlePopup();
    }, [])

    return (
        <div>
            <Button onClick={handlePopup}>Login</Button>
        </div>
    )
}

export default Login
