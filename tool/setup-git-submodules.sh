#!/bin/bash
#
# This program used by developer to do some preparation jobs
#
# Usage: ./tool/setup-git-submodules.sh
#

set +e
#set +x

cwd=`pwd`

no_submodule=1

setup_git_submodules() {
  echo -e "\n=>[Setup git submodules]"

  local submodule_dir=$1

  # enter the folder
  cd $submodule_dir

  # get remote origin url
  local origin_url=($(git config --list | egrep remote.origin.url | cut -d"=" -f2))
  local base_url=${origin_url%/*}
  echo "Base Url: "$base_url

  # get submodule names and urls array
  local submodules=($(egrep -n submodule .gitmodules | cut -d\" -f2))
  local urls=(`egrep url .gitmodules | cut -d" " -f3`)
  local paths=(`egrep path .gitmodules | cut -d" " -f3`)
  local branches=(`egrep branch .gitmodules | cut -d" " -f3`)
  local length=$((${#submodules[@]} - 1))
  for index in $(seq 0 $length); do
    local submodule_name=${submodules[index]}
    local submodule_url=${urls[index]}
    local submodule_endpoint=${submodule_url##*/}
    local updated_url=($base_url/$submodule_endpoint)
    echo "=>[Set submodule url $updated_url, for $submodule_name]"
    git config submodule.$submodule_name.url $updated_url
    git config submodule.$submodule_name.active true
  done

  # init submodules
  git submodule update --init

  # checkout remote branch in submodule
  for index in $(seq 0 $length); do
    local submodule_path=$submodule_dir/${paths[index]}
    cd $submodule_path
    echo "=>[Checkout remote branch in $submodule_path]"
    git checkout -B ${branches[index]} origin/${branches[index]}
    git log -1
    cd $submodule_dir
  done

  cd $submodule_dir
  # copy commit-msg hook to each submodule if it is existed
  local git_config_dir=$submodule_dir/.git
  if [ -f $git_config_dir ]; then
    git_config_dir=`cat $git_config_dir | cut -d' ' -f2`
  fi
  git_config_dir=$git_config_dir/modules
  if [ -e $cwd/.git/hooks/commit-msg ]; then
    # echo "git submodules config dir: "$git_config_dir
    for index in $(seq 0 $length); do
      local submodule_name=${submodules[index]}
      local git_config_hooks_dir=$git_config_dir/$submodule_name/hooks/
      echo "=>[Copy commit-msg to $git_config_hooks_dir]"
      cp $cwd/.git/hooks/commit-msg $git_config_hooks_dir
    done
  fi
}

setup_git_submodules_recursively() {
  local submodule_dir=$1

  if [ -e $submodule_dir/.gitmodules ]; then
    echo -e "\n==>[Find submodules in: $submodule_dir]"

    local submodules=($(egrep -n submodule .gitmodules | cut -d\" -f2))
    local paths=(`egrep path .gitmodules | cut -d" " -f3`)
    local length=$((${#submodules[@]} - 1))

    # setup single git submodule
    setup_git_submodules $submodule_dir

    # detect submodule in recursive
    for index in $(seq 0 $length); do
      submodule_path=$submodule_dir/${paths[index]}

      if [ ! -e $submodule_path/.gitmodules ]; then
        continue
      fi

      setup_git_submodules_recursively $submodule_path
    done
  fi
}

#set -x
set -e
