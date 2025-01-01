import React from "react";
import { Button } from "@/components/ui/button";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { membersData } from "@/membersData";

const NavigateMembers = () => {
  const navigate = useNavigate();

  const handleButtonClick = (member_id) => {
    navigate(`/creditconsumed/${member_id}`);
  };

  return (
    <>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col">
        {membersData.map((member) => {
          return (
            <Button
              className="h-16 w-16 p-2 "
              variant="secondary"
              key={member.member_id}
              onClick={() => handleButtonClick(member.member_id)}
            >
              <img
                className="rounded object-cover h-full w-full"
                src={member.img_src}
                alt={member.member_name}
              />
            </Button>
          );
        })}
      </div>
    </>
  );
};

export default NavigateMembers;
