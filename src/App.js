import React, { useState, useEffect, useContext } from 'react'
import Routes from "./Routes";
import authContext from "./context/Auth";
// const PrivateRoute = ({ children, ...rest }) => {
//   let auth = useContext(authContext);
//
//   return (
//     <Route
//       {...rest}
//       render={({ location }) => children }
//       // render={({ location }) =>
//       //   auth.isLogin ? (
//       //     children
//       //   ) : (
//       //     <Redirect
//       //       to={{
//       //         pathname: "/login",
//       //         state: { from: location }
//       //       }}
//       //     />
//       //   )
//       // }
//     />
//   );
// }
const App = () => {
  const [auth, setAuth] = useState({
    isLogin: false,
    account: null,
    publicKey: null,
    wax: 0,
    tlm: 0,
    cpu: 0,
    ram: 0,
  });
  return (
    <authContext.Provider value={auth}>
      <Routes />
    </authContext.Provider>
  )
}

export default App
