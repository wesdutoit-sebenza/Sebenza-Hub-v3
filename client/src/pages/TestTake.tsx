import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TestQuestion {
  id: string;
  format: string;
  stem: string;
  options: any;
  maxPoints: number;
  orderIndex: number;
}

interface TestSection {
  id: string;
  title: string;
  description: string | null;
  items: TestQuestion[];
}

export default function TestTake() {
  const { referenceNumber, attemptId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Fetch attempt details
  const { data: attemptData } = useQuery({
    queryKey: ["/api/test-attempts", attemptId],
    queryFn: async () => {
      const response = await fetch(`/api/test-attempts/${attemptId}`);
      if (!response.ok) throw new Error("Failed to load attempt");
      return response.json();
    },
    enabled: !!attemptId,
  });

  // Fetch test questions
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["/api/test-attempts", attemptId, "questions"],
    queryFn: async () => {
      const response = await fetch(`/api/test-attempts/${attemptId}/questions`);
      if (!response.ok) throw new Error("Failed to load questions");
      const data = await response.json();
      
      // Initialize answers from existing responses
      if (data.responses) {
        const existingAnswers: Record<string, any> = {};
        data.responses.forEach((r: any) => {
          existingAnswers[r.itemId] = r.response;
        });
        setAnswers(existingAnswers);
      }
      
      return data;
    },
    enabled: !!attemptId,
  });

  // Fetch test details for timer
  const { data: testData } = useQuery({
    queryKey: ["/api/tests/take", referenceNumber],
    enabled: !!referenceNumber,
  });

  // Initialize timer based on server-side start time
  useEffect(() => {
    const data = testData as any;
    const attempt = (attemptData as any)?.attempt;
    
    if (data?.test?.durationMinutes && attempt?.startedAt) {
      const startedAt = new Date(attempt.startedAt);
      setStartTime(startedAt);
      
      const durationMs = data.test.durationMinutes * 60 * 1000;
      const elapsedMs = Date.now() - startedAt.getTime();
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      const remainingSec = Math.floor(remainingMs / 1000);
      
      setTimeRemaining(remainingSec);
      
      // If time is already up, auto-submit
      if (remainingSec <= 0) {
        submitTestMutation.mutate();
      }
    }
  }, [testData, attemptData]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          submitTestMutation.mutate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Fullscreen management and anti-cheat tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      
      // Track exit from fullscreen
      if (isFullscreen && !inFullscreen) {
        const newCount = fullscreenExits + 1;
        setFullscreenExits(newCount);
        
        // Send anti-cheat event to server
        recordAntiCheatEvent("fullscreen_exit");
      }
      
      setIsFullscreen(inFullscreen);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitches + 1;
        setTabSwitches(newCount);
        
        // Send anti-cheat event to server
        recordAntiCheatEvent("tab_switch");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isFullscreen, fullscreenExits, tabSwitches]);

  // Record anti-cheat events
  const recordAntiCheatEvent = async (eventType: string) => {
    try {
      await apiRequest("POST", `/api/test-attempts/${attemptId}/anti-cheat`, {
        eventType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to record anti-cheat event:", error);
    }
  };

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }
  };

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ itemId, response }: { itemId: string; response: any }) => {
      const res = await apiRequest("POST", `/api/test-attempts/${attemptId}/responses`, {
        itemId,
        response,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-attempts", attemptId, "questions"] });
    },
  });

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: async () => {
      // Calculate time spent from server-side start time
      const timeSpentSeconds = startTime 
        ? Math.floor((Date.now() - startTime.getTime()) / 1000)
        : null;
      
      const res = await apiRequest("POST", `/api/test-attempts/${attemptId}/submit`, {
        timeSpentSeconds,
        fullscreenExits,
        tabSwitches,
      });
      return res.json();
    },
    onSuccess: () => {
      navigate(`/test/${referenceNumber}/results/${attemptId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit test",
        variant: "destructive",
      });
    },
  });

  const sections: TestSection[] = questionsData?.sections || [];
  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.items?.[currentQuestionIndex];

  const totalQuestions = sections.reduce((acc, section) => acc + section.items.length, 0);
  const currentQuestionNumber = sections
    .slice(0, currentSectionIndex)
    .reduce((acc, section) => acc + section.items.length, 0) + currentQuestionIndex + 1;

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Auto-save answer
    submitAnswerMutation.mutate({
      itemId: currentQuestion.id,
      response: value,
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentSection.items.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(sections[currentSectionIndex - 1].items.length - 1);
    }
  };

  const isLastQuestion = 
    currentSectionIndex === sections.length - 1 &&
    currentQuestionIndex === currentSection?.items?.length - 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">Loading test questions...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentSection || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Unable to load test questions. Please try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">
                Question {currentQuestionNumber} of {totalQuestions}
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-sm text-muted-foreground">
                {currentSection.title}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span className={timeRemaining < 300 ? "text-destructive" : ""}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              {!isFullscreen && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={enterFullscreen}
                  data-testid="button-enter-fullscreen"
                >
                  Enter Fullscreen
                </Button>
              )}
            </div>
          </div>
          <Progress 
            value={(currentQuestionNumber / totalQuestions) * 100} 
            className="mt-3 h-1"
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.stem}
            </CardTitle>
            <CardDescription>
              {currentQuestion.maxPoints} {currentQuestion.maxPoints === 1 ? "point" : "points"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MCQ Options */}
            {currentQuestion.format === "mcq" && Array.isArray(currentQuestion.options) && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleAnswerChange}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((choice: string, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 p-4 rounded-lg border hover-elevate cursor-pointer"
                    >
                      <RadioGroupItem
                        value={choice}
                        id={`q-${currentQuestion.id}-${index}`}
                        data-testid={`radio-answer-${index}`}
                      />
                      <Label
                        htmlFor={`q-${currentQuestion.id}-${index}`}
                        className="flex-1 cursor-pointer leading-relaxed"
                      >
                        {choice}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                data-testid="button-previous-question"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={submitTestMutation.isPending}
                  data-testid="button-submit-test"
                >
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={goToNextQuestion}
                  data-testid="button-next-question"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your test? Once submitted, you cannot make any changes.
              {Object.keys(answers).length < totalQuestions && (
                <div className="mt-2 text-destructive">
                  Warning: You have answered {Object.keys(answers).length} out of {totalQuestions} questions.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-submit">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitTestMutation.mutate()}
              disabled={submitTestMutation.isPending}
              data-testid="button-confirm-submit"
            >
              {submitTestMutation.isPending ? "Submitting..." : "Submit Test"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
