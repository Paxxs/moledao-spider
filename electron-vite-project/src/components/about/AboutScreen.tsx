import { useTranslation } from 'react-i18next'
import { Mail, UserRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { appMeta } from '@/lib/meta'

interface Props {
  onOpenExternal: (url: string) => Promise<void>
}

export const AboutScreen = ({ onOpenExternal }: Props) => {
  const { t } = useTranslation()

  return (
    <Card className="min-h-[480px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
      <CardHeader>
        <CardTitle>{t('aboutTitle')}</CardTitle>
        <CardDescription>{t('appTagline')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Badge variant="secondary" className="text-xs uppercase tracking-[0.3em]">
            v{appMeta.version}
          </Badge>
          <Badge variant="outline" className="bg-amber-700 text-emerald-200">
            Ai Word Export
          </Badge>
        </div>

        <ScrollArea className="h-48 pr-4 text-sm text-muted-foreground">
          <p className="leading-relaxed text-base text-foreground/90">{t('aboutDescription')}</p>
          <p className="mt-4">
            Made with ❤️ by SuperPaxos <br />
            © MorFans.cn. All rights reserved.
          </p>
        </ScrollArea>

        <Separator className="opacity-40" />

        <div className="grid gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <UserRound className="h-4 w-4" />
            <span className="font-medium text-foreground">{t('authorLabel')}</span>
            <span>{appMeta.author}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4" />
            <span className="font-medium text-foreground">{t('contactLabel')}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="link" className="h-auto p-0" onClick={() => onOpenExternal(appMeta.contact)}>
                    <span className="text-selectable">{appMeta.contact}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('contactLabel')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card >
  )
}
