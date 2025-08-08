import { FC } from "react";

interface interval {
  start_time:string;
  end_time: string;
}

interface actionPartProps{
  action:interval;
  setAction: React.Dispatch<React.SetStateAction<interval>>;
}

const ActionPart: FC<actionPartProps> = () =>{

  return(<div></div>)

}

export default ActionPart;
