
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function HandleDefaultLogin(){

  const navigate = useNavigate();

  const { user, login } = useUser();

  fetch("/api/user").then(x=>x.json()).then((data)=>{
    login(data.user.given_name, data.user.role); 
    navigate("/");





  });



  return (<> <p>Logging you in!</p> </>)
}



