// /client/src/components/SupplementQuiz.tsx
import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../api/quizApi';
import type { HealthGoal, QuizPayload } from '../types/Quiz';

const goals: HealthGoal[] = ['Energy', 'Immunity', 'Joint Health', 'Sleep', 'Digestion', 'Stress'];
const restrictions: string[] = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Soy-Free'];

const SupplementQuiz: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [age, setAge] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoalToggle = (goal: HealthGoal) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleRestrictionToggle = (restriction: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction) ? prev.filter(r => r !== restriction) : [...prev, restriction]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    if (step === 3 && selectedGoals.length > 0 && age && age >= 18) {
      setIsLoading(true);
      setError(null);
      
      const payload: QuizPayload = {
        selectedGoals,
        dietaryRestrictions,
        age: Number(age),
      };

      try {
        await quizApi.submitQuiz(payload, user);
        navigate('/recommendations'); // Redirect to recommendation page
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit quiz.');
      } finally {
        setIsLoading(false);
      }
    } else {
        // Validation for goals
        if (step === 2 && selectedGoals.length === 0) {
            setError("Please select at least one health goal.");
            return;
        }
        // Validation for age
        if (step === 3 && (!age || age < 18)) {
            setError("Please enter a valid age (18+).");
            return;
        }

        setError(null);
        setStep(step + 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-vita-primary">Step 1: Your Personal Details</h3>
            <label className="block">
              <span className="text-gray-700">Age:</span>
              <input
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </label>
            <label className="block">
                <span className="text-gray-700">Dietary Restrictions (Optional):</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {restrictions.map(r => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => handleRestrictionToggle(r)}
                            className={`p-2 rounded-lg border transition-colors ${
                                dietaryRestrictions.includes(r) ? 'bg-vita-secondary text-vita-text border-vita-secondary' : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </label>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-vita-primary">Step 2: What are Your Primary Health Goals?</h3>
            <p className="text-gray-600">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-4">
              {goals.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-md ${
                    selectedGoals.includes(goal) 
                      ? 'bg-vita-primary text-white border-vita-primary transform scale-105' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-vita-secondary'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            {selectedGoals.length === 0 && (
                <p className="text-sm text-red-500">You must select at least one goal.</p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <h3 className="text-2xl font-bold text-vita-primary mb-4">Ready for Your Personalized Plan?</h3>
            <p className="text-gray-700">Based on your goals ({selectedGoals.length}) and details, we will find the perfect supplements for you.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-center text-vita-text">
          Personalized Plan Quiz
        </h2>
        
        <div className="flex justify-between items-center text-sm font-medium">
            <span className={`p-2 rounded-full ${step === 1 ? 'bg-vita-primary text-white' : 'bg-gray-200'}`}>1</span>
            <div className="h-1 flex-1 mx-2 bg-gray-200 rounded-full">
                <div className={`h-full ${step >= 2 ? 'bg-vita-primary' : ''} rounded-full`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            </div>
            <span className={`p-2 rounded-full ${step === 2 ? 'bg-vita-primary text-white' : 'bg-gray-200'}`}>2</span>
            <div className="h-1 flex-1 mx-2 bg-gray-200 rounded-full">
                <div className={`h-full ${step === 3 ? 'bg-vita-primary' : ''} rounded-full`} style={{ width: step === 3 ? '100%' : '0%' }}></div>
            </div>
            <span className={`p-2 rounded-full ${step === 3 ? 'bg-vita-primary text-white' : 'bg-gray-200'}`}>3</span>
        </div>

        {error && (
          <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="py-2 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`py-2 px-8 text-lg font-semibold text-white rounded-lg transition duration-150 ml-auto ${
                isLoading 
                  ? 'bg-vita-secondary opacity-70 cursor-not-allowed' 
                  : 'bg-vita-secondary hover:bg-[#ffb000]'
              }`}
            >
              {isLoading ? 'Processing...' : step === 3 ? 'Get My Plan' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplementQuiz;