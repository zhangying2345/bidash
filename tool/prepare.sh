#!/bin/bash
#
# This program used by developer to do some preparation jobs
#

set +e
#set +x

start_date=`date +"%F %T"`

cwd=`pwd`
echo "cwd: "$cwd

# import
source $cwd/tool/setup-git-submodules.sh

check() {
  echo -e "\n==>[Check Environment]"

  # check version of node, npm, yarn
  echo 'node: '`node -v`
  echo 'npm: '`npm -v`
  echo 'yarn: '`yarn -v`

  npm config get prefix
  npm config ls
}

setup_scaffold() {
  echo -e "\n==>[Setup scaffold system]"

  cd $cwd/.scaffold
  yarn install
}

setup_project() {
  echo -e "\n==>[Install npm packages]"

  cd $cwd
  yarn install
}

main() {
  # print help
  if [ $# -ne 0 ]; then
    echo -e "\nUsage: `basename $0`\n"
    exit 0
  fi

  # do some check
  # if it dosn't exist, it dosn't means a npm project, so ignore this step
  if [ -e $cwd/package.json ]; then
    check
  fi

  # setup git submodules
  setup_git_submodules_recursively $cwd

  # setup scaffold
  # if it dosn't exist, ignore this step
  if [ -e $cwd/.scaffold/package.json ]; then
    setup_scaffold
  fi

  # setup current project
  # if it dosn't exist, ignore this step
  if [ -e $cwd/package.json ]; then
    setup_project
  fi
}

main "$@"

end_date=`date +"%F %T"`

echo -e "\n[ Run \"$0\" Done. $start_date ~ $end_date ]\n"

#set -x
set -e
