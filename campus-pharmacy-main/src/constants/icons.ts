import { 
  BeakerIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export const Icons = {
  Pill: AcademicCapIcon, // Using AcademicCapIcon as a placeholder for Pill
  Beaker: BeakerIcon,
  Sparkles: SparklesIcon,
}

export type IconName = keyof typeof Icons