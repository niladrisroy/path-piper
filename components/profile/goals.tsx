
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface GoalsProps {
  student: any;
  currentUser: any;
}

const Goals: React.FC<GoalsProps> = ({ student, currentUser }) => {
  const router = useRouter();
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    // Extract career goals from student data
    if (student && student.careerGoals) {
      setGoals(student.careerGoals);
    }
  }, [student]);

  const handleEdit = () => {
    // Redirect to the edit profile section
    router.push("/student/profile/edit");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Goals</h2>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {goals.length > 0 ? (
        <ul className="list-disc pl-5">
          {goals.map((goal, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {goal}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No goals added yet.</p>
      )}
    </div>
  );
};

export default Goals;
