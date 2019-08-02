#!/bin/bash
#
# This program used to generate environment variables for CI Env
#

set +e
#set +x

start_date=`date +"%F %T"`

cwd=`pwd`

main() {
  # print help
  if [ $# -ne 2 ]; then
    echo -e "\nUsage: `basename $0` <project root dir> <output file name>\n"
    exit 0
  fi

  echo "cwd: "$cwd

  local root_dir=$cwd/$1
  local file=$cwd/$2

  local build_time=`date +%Y%m%dT%H%M%S`
  echo build_time=$build_time >> $file

  local day_time=`date +%Y%m%d`
  local upload_folder_name=$day_time
  echo upload_folder_name=$upload_folder_name > $file

  local package_version=`cat $root_dir/package.json | grep version | cut -d"\"" -f4`
  echo version=$package_version >> $file

  local package_name=`cat $root_dir/package.json | grep \"name\" | cut -d"\"" -f4`
  echo build_tag=$package_name-$build_time >> $file
}

main "$@"

end_date=`date +"%F %T"`

echo -e "\n[ Run \"$0\" Done. $start_date ~ $end_date ]\n"

#set -x
set -e
