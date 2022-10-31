(
  trap "kill 0" EXIT
    ruby ./ws_server/hsquicklook_ws_server.rb &
    cd clients/quicklook_spring8_2022
    python3 -m http.server
  wait
)