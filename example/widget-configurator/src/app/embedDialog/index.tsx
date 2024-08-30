import React, { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import JSIcon from '../../assets/js.svg'
import ReactIcon from '../../assets/react.svg'

import { Tab } from '@mui/material'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import Tabs from '@mui/material/Tabs'
import SyntaxHighlighter from 'react-syntax-highlighter'
import SVG from 'react-inlinesvg'
// eslint-disable-next-line no-restricted-imports
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { jsExample } from './utils/jsExample'
import { reactExample } from './utils/reactExample'

interface TabInfo {
  id: number
  label: string
  language: string
  snippetFromParams(params: any): string
  icon: string
}

const TABS: TabInfo[] = [
  {
    id: 0,
    label: 'React',
    language: 'javascript',
    snippetFromParams: reactExample,
    icon: ReactIcon,
  },
  {
    id: 1,
    label: 'Javascript',
    language: 'javascript',
    snippetFromParams: jsExample,
    icon: JSIcon,
  },
]

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

function a11yProps(id: number) {
  return {
    id: `simple-tab-${id}`,
    'aria-controls': `simple-tabpanel-${id}`,
  }
}

export interface EmbedDialogProps {
  params: any
  open: boolean
  handleClose: any
}

export function EmbedDialog({ params, open, handleClose }: EmbedDialogProps) {
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')
  const [tabInfo, setCurrentTabInfo] = useState<TabInfo>(TABS[0])
  const { id, language, snippetFromParams } = tabInfo
  const descriptionElementRef = useRef<HTMLElement>(null)

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setSnackbarOpen(true)
  }

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  useEffect(() => {
    if (open) {
      setScroll('paper')
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  const code = useMemo(() => {
    return snippetFromParams(params)
  }, [snippetFromParams, params])

  const onChangeTab = useCallback((_event: SyntheticEvent, newValue: TabInfo) => setCurrentTabInfo(newValue), [])

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="lg"
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle id="scroll-dialog-title">Snippet for Okx Widget</DialogTitle>

        <DialogContent dividers={scroll === 'paper'}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabInfo}
              onChange={onChangeTab}
              aria-label="languages"
              sx={{
                '& .MuiTab-iconWrapper': {
                  height: '16px',
                  width: '16px',
                  opacity: 0.75,
                },
                '& .Mui-selected .MuiTab-iconWrapper': {
                  opacity: 1,
                },
              }}
            >
              {TABS.map((info) => {
                return (
                  <Tab
                    key={info.id}
                    label={info.label}
                    icon={<SVG src={info.icon} />}
                    value={info}
                    {...a11yProps(info.id)}
                  />
                )
              })}
            </Tabs>
          </Box>

          <div role="tabpanel" id={`simple-tabpanel-${id}`} aria-labelledby={`simple-tab-${id}`}>
            <SyntaxHighlighter
              showLineNumbers={true}
              children={code}
              language={language}
              style={nightOwl}
              customStyle={{ fontSize: '0.8em' }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCopy}>Copy</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Successfully copied to clipboard!
        </Alert>
      </Snackbar>
    </div>
  )
}
