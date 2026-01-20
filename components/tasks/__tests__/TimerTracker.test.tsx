import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimerTracker } from '../TimerTracker';

describe('TimerTracker', () => {
  const mockOnStart = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnStop = vi.fn();
  const mockOnAddManualTime = vi.fn();

  const defaultProps = {
    totalSeconds: 100,
    estimatedSeconds: 3600,
    onStart: mockOnStart,
    onPause: mockOnPause,
    onStop: mockOnStop,
    onAddManualTime: mockOnAddManualTime,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render timer display', () => {
    render(<TimerTracker {...defaultProps} />);
    expect(screen.getByText('Timer Tracker')).toBeInTheDocument();
  });

  it('should display total time correctly', () => {
    render(<TimerTracker {...defaultProps} totalSeconds={3661} />);
    expect(screen.getByText((content) => content.includes('1:01:01'))).toBeInTheDocument();
  });

  it('should show progress bar when estimated time is set', () => {
    render(<TimerTracker {...defaultProps} totalSeconds={1800} estimatedSeconds={3600} />);
    expect(screen.getByText((content) => content.includes('50%'))).toBeInTheDocument();
  });

  it('should show Start button when timer is not running', () => {
    render(<TimerTracker {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument();
  });

  it('should call onStart when Start button is clicked', () => {
    render(<TimerTracker {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should show Pause button when timer is running', () => {
    render(<TimerTracker {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
  });

  it('should call onPause when Pause button is clicked', () => {
    render(<TimerTracker {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it('should show Stop button', () => {
    render(<TimerTracker {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
  });

  it('should call onStop when Stop button is clicked', () => {
    render(<TimerTracker {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
    fireEvent.click(screen.getByRole('button', { name: /Stop/i }));
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('should show Add Manual Time button', () => {
    render(<TimerTracker {...defaultProps} />);
    expect(screen.getByText(/Add Manual Time/)).toBeInTheDocument();
  });

  it('should call onAddManualTime with correct value', () => {
    render(<TimerTracker {...defaultProps} />);
    fireEvent.click(screen.getByText(/Add Manual Time/));
    fireEvent.change(screen.getByPlaceholderText('Enter minutes'), { target: { value: '30' } });
    const addBtn = screen.getAllByRole('button').find(btn => btn.textContent === 'Add');
    fireEvent.click(addBtn!);
    expect(mockOnAddManualTime).toHaveBeenCalledWith(30);
  });

  describe('edge cases', () => {
    it('should handle rapid clicks on Start button', () => {
      render(<TimerTracker {...defaultProps} />);
      // First click - Start button exists
      fireEvent.click(screen.getByRole('button', { name: /Start/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(1);
      // After start, button changes to Pause
      expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
    });

    it('should handle stop when not running', () => {
      render(<TimerTracker {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /Stop/i }));
      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });

    it('should handle negative manual time input', () => {
      render(<TimerTracker {...defaultProps} />);
      fireEvent.click(screen.getByText(/Add Manual Time/));
      fireEvent.change(screen.getByPlaceholderText('Enter minutes'), { target: { value: '-10' } });
      const addBtn = screen.getAllByRole('button').find(btn => btn.textContent === 'Add');
      fireEvent.click(addBtn!);
      expect(mockOnAddManualTime).not.toHaveBeenCalled();
    });

    it('should handle very large manual time input', () => {
      render(<TimerTracker {...defaultProps} />);
      fireEvent.click(screen.getByText(/Add Manual Time/));
      fireEvent.change(screen.getByPlaceholderText('Enter minutes'), { target: { value: '999999' } });
      const addBtn = screen.getAllByRole('button').find(btn => btn.textContent === 'Add');
      fireEvent.click(addBtn!);
      expect(mockOnAddManualTime).toHaveBeenCalledWith(999999);
    });

    it('should handle empty manual time input', () => {
      render(<TimerTracker {...defaultProps} />);
      fireEvent.click(screen.getByText(/Add Manual Time/));
      fireEvent.change(screen.getByPlaceholderText('Enter minutes'), { target: { value: '' } });
      const addBtn = screen.getAllByRole('button').find(btn => btn.textContent === 'Add');
      fireEvent.click(addBtn!);
      expect(mockOnAddManualTime).not.toHaveBeenCalled();
    });

    it('should handle zero manual time input', () => {
      render(<TimerTracker {...defaultProps} />);
      fireEvent.click(screen.getByText(/Add Manual Time/));
      fireEvent.change(screen.getByPlaceholderText('Enter minutes'), { target: { value: '0' } });
      const addBtn = screen.getAllByRole('button').find(btn => btn.textContent === 'Add');
      fireEvent.click(addBtn!);
      expect(mockOnAddManualTime).not.toHaveBeenCalled();
    });
  });

  describe('complete workflows', () => {
    it('should complete full timer lifecycle', () => {
      render(<TimerTracker {...defaultProps} />);

      // Start
      fireEvent.click(screen.getByRole('button', { name: /Start/i }));
      expect(mockOnStart).toHaveBeenCalled();

      // Pause
      fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
      expect(mockOnPause).toHaveBeenCalled();

      // Resume (click Start again)
      fireEvent.click(screen.getByRole('button', { name: /Start/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(2);

      // Stop
      fireEvent.click(screen.getByRole('button', { name: /Stop/i }));
      expect(mockOnStop).toHaveBeenCalled();
    });

    it('should handle start and stop without pause', () => {
      render(<TimerTracker {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Start/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Stop/i }));
      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple pause-resume cycles', () => {
      render(<TimerTracker {...defaultProps} />);

      // First cycle
      fireEvent.click(screen.getByRole('button', { name: /Start/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
      expect(mockOnPause).toHaveBeenCalledTimes(1);

      // Second cycle
      fireEvent.click(screen.getByRole('button', { name: /Start/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(2);

      fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
      expect(mockOnPause).toHaveBeenCalledTimes(2);

      // Third cycle
      fireEvent.click(screen.getByRole('button', { name: /Start/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(3);
    });
  });
});
