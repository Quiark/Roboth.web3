color molokai
let g:pymode_rope = 0
let g:pymode_rope_completion = 0

" TODO: doesnt work
let &grepprg='ack --ignore-dir=app/.meteor/'

AirlineTheme hybridline

e tools/contract.py
PymodeVirtualenv "../pyethereum/env"

command! -nargs=1 Ethereum silent !python tools\contract.py <args>
command! -nargs=1 EthereumC cexpr system('python tools\\contract.py <args>')

nmenu Plugin.Ethere&um.&Mine :Ethereum mine<CR>
nmenu Plugin.Ethere&um.&Rest :Ethereum rest<CR>
nmenu Plugin.Ethere&um.&Up :EthereumC up<CR>

compiler python

VimFilerExplorer
