#!/bin/bash
#
# This program used by developer to do some preparation jobs
#
# Usage: ./tool/setup-git-submodules.sh
#

set +e
#set +x

start_date=`date +"%F %T"`

cwd=`pwd`

# import
source $cwd/tool/setup-git-submodules.sh

# check git submodule existed
has_git_submodules=false
if [ -e .gitmodules ]; then
  has_git_submodules=true
fi

main() {
  # print help
  if [ $# -ne 0 ]; then
    echo -e "\nUsage: `basename $0`\n"
    exit 0
  fi

  if [ "$has_git_submodules" = false ]; then
    echo -e "Current git repo dosn't contains submodules\n"
    exit 0
  fi

  echo "cwd: "$cwd

  # setup git submodules
  setup_git_submodules_recursively $cwd
}

main "$@"

end_date=`date +"%F %T"`

echo -e "\n[ Run \"$0\" Done. $start_date ~ $end_date ]\n"

#set -x
set -e
