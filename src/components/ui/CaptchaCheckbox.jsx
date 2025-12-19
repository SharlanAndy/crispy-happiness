import { useState, useRef, useCallback } from 'react';
import Captcha from '../icons/Captcha';

// Simple visual captcha - no API keys needed
const PATTERNS = [
  '🔴', '🔵', '🟢', '🟡', '🟣', '🟠', // Colored circles
  '⚪', '⚫',                           // White and black circles
  '🟦', '🟥', '🟧', '🟨', '🟩', '🟪', // Colored squares
  '⭐', '❤️', '💛', '💚', '💙', '💜', // Stars and hearts
  '🔸', '🔹', '🔶', '🔷',             // Diamond shapes
  '🔺', '🔻', '🔳', '🔲',             // Triangle and square shapes
  '💎', '🏆', '🎯', '🎲',             // Objects
  '🌙', '☀️', '✨', '🌟',             // Celestial
  '🔥', '💧', '🌊', '⚡',             // Elements
  '🎨', '🎭', '🎪', '🎬',             // Entertainment
  '🚀', '✈️', '🚗', '🚲',             // Vehicles
  '🍎', '🍌', '🍇', '🍓',             // Fruits
  '🌹', '🌻', '🌺', '🌸',             // Flowers
  '🐾', '👁️', '👂', '👃',             // Body parts
  '⚓', '🔱', '⚡', '⭕',              // Symbols
  '🎈', '🎁', '🎀', '🎊',             // Party
  '🏠', '🏰', '🗼', '🗽',             // Buildings
];

export default function CaptchaCheckbox({ 
  checked, 
  onChange, 
  onTokenChange, 
  onError, 
  label = 'I am human' 
}) {
  const [showChallenge, setShowChallenge] = useState(false);
  const [targetPatterns, setTargetPatterns] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [shuffledBoard, setShuffledBoard] = useState([]);
  // Use refs for tracking values that don't need to trigger re-renders
  const previousBoardOrderRef = useRef('');
  const usedColorsRef = useRef([]);
  const [uniqueId] = useState(() => `captcha-checkbox-${Math.random().toString(36).substring(7)}`);

  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const generateShuffledBoard = useCallback((targetPattern, previousOrder) => {
    // Always show exactly 9 patterns in a 3x3 grid
    // Target pattern must be included
    const otherPatterns = PATTERNS.filter(p => p !== targetPattern);
    const shuffledOthers = shuffleArray(otherPatterns);
    
    // Take 8 random patterns from the rest, plus the target pattern
    const selectedOthers = shuffledOthers.slice(0, 8);
    const boardWithTarget = [...selectedOthers, targetPattern];
    
    // Shuffle the final board so target isn't always last
    let shuffled = shuffleArray(boardWithTarget);
    let attempts = 0;
    const maxAttempts = 20; // Prevent infinite loop
    
    // Ensure the new shuffle is different from the previous one
    while (shuffled.join(',') === previousOrder && attempts < maxAttempts) {
      shuffled = shuffleArray(boardWithTarget);
      attempts++;
    }
    return shuffled;
  }, [shuffleArray]);

  const generateRandomPattern = useCallback((excludeColors = []) => {
    const availableColors = PATTERNS.filter(color => !excludeColors.includes(color));
    if (availableColors.length === 0) {
      // Fallback if all colors are used (shouldn't happen with 6 colors and 3 clicks)
      return PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    }
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }, []);

  const generateChallenge = useCallback(() => {
    // Generate first random pattern - ensure unique colors across all 3 clicks
    const firstPattern = generateRandomPattern([]);
    setTargetPatterns([firstPattern]);
    usedColorsRef.current = [firstPattern];
    setSelectedCount(0);
    // Generate board with exactly 9 patterns (3x3 grid), including the target
    const initialBoard = generateShuffledBoard(firstPattern, '');
    setShuffledBoard(initialBoard);
    previousBoardOrderRef.current = initialBoard.join(',');
    setShowChallenge(true);
  }, [generateRandomPattern, generateShuffledBoard]);

  const handleCheckboxChange = useCallback((e) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Show challenge when checkbox is checked
      generateChallenge();
    } else {
      // Reset when unchecked
      setShowChallenge(false);
      setSelectedCount(0);
      setTargetPatterns([]);
      setShuffledBoard([]);
      previousBoardOrderRef.current = '';
      usedColorsRef.current = [];
      onChange(false);
      if (onTokenChange) {
        onTokenChange(null);
      }
    }
  }, [generateChallenge, onChange, onTokenChange]);

  const handlePatternClick = useCallback((e, pattern) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showChallenge || targetPatterns.length === 0) return;
    
    // Get the current target pattern for this click (0-indexed)
    const currentTargetPattern = targetPatterns[selectedCount];
    
    if (pattern === currentTargetPattern) {
      const newCount = selectedCount + 1;
      
      if (newCount >= 3) {
        // User completed all 3 clicks with correct patterns - verified!
        const token = `captcha_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        onChange(true);
        if (onTokenChange) {
          onTokenChange(token);
        }
        setShowChallenge(false);
        setSelectedCount(0);
        setTargetPatterns([]);
        setShuffledBoard([]);
        previousBoardOrderRef.current = '';
        usedColorsRef.current = [];
      } else {
        // Generate a new random pattern for the next click
        // CRITICAL: Ensure no color repetition across all 3 clicks
        // Read current used colors from ref
        const prevUsed = usedColorsRef.current;
        const nextPattern = generateRandomPattern(prevUsed);
        usedColorsRef.current = [...prevUsed, nextPattern];
        
        // Update target patterns
        setTargetPatterns(prev => {
          const updated = [...prev];
          updated[newCount] = nextPattern;
          return updated;
        });
        
        // Generate a new board shuffle that's different from previous
        // Read current board order from ref
        const prevOrder = previousBoardOrderRef.current;
        // Generate new board with exactly 9 patterns, including the new target
        const newBoard = generateShuffledBoard(nextPattern, prevOrder);
        setShuffledBoard(newBoard);
        previousBoardOrderRef.current = newBoard.join(',');
        
        setSelectedCount(newCount);
      }
    } else {
      // Wrong pattern clicked - silently reset challenge back to 0
      // User can retry without any error prompts
      generateChallenge();
    }
  }, [showChallenge, targetPatterns, selectedCount, onChange, onTokenChange, generateChallenge, generateRandomPattern, generateShuffledBoard]);

  return (
    <div className="bg-neutral-50 border-[#e0e0e0] border rounded-md px-4 py-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={uniqueId}
            checked={checked}
            onChange={handleCheckboxChange}
            disabled={showChallenge}
            className="w-5 h-5 border-[#c5c5c5] border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label 
            htmlFor={uniqueId} 
            className={`font-['Roboto',sans-serif] text-sm cursor-pointer select-none ${
              checked 
                ? 'text-green-600 font-medium' 
                : 'text-[#555555]'
            }`}
          >
            {checked ? (
              <span className="flex items-center gap-2">
                <span>✅</span>
                {label} (Verified)
              </span>
            ) : (
              label
            )}
          </label>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="size-9">
            <Captcha />
          </div>
          <div className="font-['Roboto',sans-serif] text-[#555555] text-xs text-center whitespace-nowrap flex items-center gap-1">
            <a 
              href="https://www.cloudflare.com/privacypolicy/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#555555] hover:text-blue-600 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy
            </a>
            <span className="text-[#555555]">Captcha</span>
            <a 
              href="https://www.cloudflare.com/website-terms/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#555555] hover:text-blue-600 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* Visual Challenge */}
      {showChallenge && targetPatterns.length > 0 && selectedCount < 3 && (
        <div className="bg-white border border-blue-200 rounded-md p-4 flex flex-col gap-3">
          <div className="text-center">
            <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#333] mb-2">
              Click the pattern <span className="text-2xl">{targetPatterns[selectedCount]}</span> ({selectedCount + 1} of 3):
            </p>
            <p className="font-['Roboto',sans-serif] text-xs text-gray-600">
              Progress: {selectedCount} / 3
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {shuffledBoard.map((pattern, index) => (
              <button
                key={`${pattern}-${index}`}
                type="button"
                onClick={(e) => handlePatternClick(e, pattern)}
                className="text-4xl p-4 border-2 border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

