http://%%DOMAIN%% {
    root * /var/www/html
    file_server

    log {
        output stdout
        format %%LOGFORMAT%%
        level %%LOGLEVEL%%
    }
}
