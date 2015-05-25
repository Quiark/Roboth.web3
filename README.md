# Roboth.web3

A simple and stupid experimental DApp for ethereum. The idea is to create a job market for people where users
can submit jobs (thus the name, from Czech 'robota' = work) for other people to do or work on other people's tasks for rewards. A bit like Mechanical Turk.
It should integrate a reputation system to allow grading the workers and selecting the best solution and sosuch.
Since this is just in a very early stage of development, the only type of task is submitting dictionary explanation
of english words. 

Based off of [SilentCicero's meteor-boilerplate](https://github.com/SilentCicero/meteor-dapp-boilerplate) 

* [Installation](#installation)
* [Deployment](#deployment)
* [File Structure](#file-structure)
* [Bootstrap and Less](#bootstrap-and-less)
* [Favicons and Touch Icons](#favicons-and-touch-icons)


## <a name="development"></a> Development

Clone this repo

	$ git clone https://github.com/Quiark/Roboth.web3

Start a geth node 

    $ geth --rpc --rpcaddr="localhost" --unlock=primary --rpcport="8080" --rpccorsdomain="http://localhost:3000" console

Start your app using meteor

    $ cd Roboth.web3/app
    $ meteor

Go to http://localhost:3000

## <a name="file-structure"></a> File Structure

This file structure is largley based off of Differentials boilerplate, but with client-only directories. Client-only files are stored in the `client` directory. The `public` directory is for publicly accessible assets such as images and fonts. The `i18n` directory is for language files.

## <a name="bootstrap-and-less"></a> Bootstrap and LESS

The majority of Bootstrap can be customized with LESS variables. If you look in `client/stylesheets/base/lib/bootstrap/variables.import.less` you will see a slew of configuration variables that can be tweaked to drastically change the look and feel of your site without having to write a single line of CSS.

However we should avoid modifying the core Bootstrap Less files (in case we want to update them later), and should instead override the variables in our own LESS files.

For example, to change the color of all primary buttons and links, simply add a `@brand-primary` variable to `stylesheets/base/variables.import.less`:

```
// variables.import.less
@brand-primary: #DC681D;
```

If you'd like to override a feature of Bootstrap that can't be modified using variables, simply create a new file in the `client/stylesheets/components` directory named after the corresponding Bootstrap component (eg. `buttons` in this case), and make your changes there.

```
// buttons.import.less
.btn {
  text-transform: uppercase;
}
```

After your file is ready, you need to import it into `client/stylesheets/base/global.less`. So, you would add in this statement:
```
@import '@{components}/buttons.import.less';
```

The reason that this is done is to avoid any issues when the LESS files are compiled into CSS. That way, if one component relies on another or you want a certain order for your components, you can avoid any issues.


## <a name="favicons-and-touch-icons"></a> Favicons and Touch Icons

Upload your image to http://realfavicongenerator.net/ and place the resulting images in `public/images/favicons`
